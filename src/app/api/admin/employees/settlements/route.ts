import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmployeeSettlement from '@/lib/models/EmployeeSettlement';
import Employee from '@/lib/models/Employee';
import { calculateMonthlyPayroll } from '@/lib/payroll-service';
import EmployeePayment from '@/lib/models/EmployeePayment';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const employeeId = searchParams.get('employeeId');

    await dbConnect();
    
    // If we request for a specific employee, generate the current preview
    if (employeeId && month && year) {
      const employee = await Employee.findById(employeeId);
      if (!employee) return NextResponse.json({ error: 'Employee not found' }, { status: 404 });

      // Check if already settled
      const existingSettlement = await EmployeeSettlement.findOne({ employeeId, month: Number(month), year: Number(year) });
      if (existingSettlement) {
        return NextResponse.json({ ...existingSettlement.toObject(), isPreview: false });
      }

      // Generate preview
      const preview = await calculateMonthlyPayroll(employeeId, employee.dailyRate, Number(month), Number(year));
      return NextResponse.json({ ...preview, isPreview: true });
    }

    // Otherwise return history of settlements
    let query: any = {};
    if (employeeId) query.employeeId = employeeId;
    if (month) query.month = Number(month);
    if (year) query.year = Number(year);

    const settlements = await EmployeeSettlement.find(query).sort({ settlementDate: -1 }).populate('employeeId', 'name employeeId');
    return NextResponse.json(settlements);
  } catch (error) {
    console.error('Error fetching settlements:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    await dbConnect();

    const employee = await Employee.findById(data.employeeId);
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Verify it's not already settled
    const existingSettlement = await EmployeeSettlement.findOne({ employeeId: data.employeeId, month: data.month, year: data.year });
    if (existingSettlement) {
      return NextResponse.json({ error: 'Account already settled for this month' }, { status: 400 });
    }

    const newSettlement = await EmployeeSettlement.create({
      ...data,
      status: 'Settled',
      settlementDate: new Date()
    });

    // Optionally create a payment record for the settlement amount if > 0
    if (data.settlementAmount > 0) {
       await EmployeePayment.create({
         employeeId: data.employeeId,
         date: new Date(),
         amount: data.settlementAmount,
         paymentType: 'Settlement',
         notes: `Settlement for ${data.month}/${data.year}`,
         createdBy: data.createdBy || 'Admin'
       });
    }

    return NextResponse.json(newSettlement, { status: 201 });
  } catch (error: any) {
    console.error('Error creating settlement:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Account already settled for this month' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { employeeId, month, year, dailyRate: customRate } = data;

    if (!employeeId || !month || !year) {
      return NextResponse.json({ error: 'Missing employeeId, month, or year' }, { status: 400 });
    }

    await dbConnect();
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const effectiveRate = customRate !== undefined && customRate !== null ? Number(customRate) : employee.dailyRate;
    const calc = await calculateMonthlyPayroll(employeeId, effectiveRate, Number(month), Number(year));

    const updatedSettlement = await EmployeeSettlement.findOneAndUpdate(
      { employeeId, month: Number(month), year: Number(year) },
      {
        $set: {
          totalWorkHours: calc.totalWorkHours,
          totalEarnedDays: calc.totalEarnedDays,
          dailyRate: effectiveRate,
          grossAmount: calc.grossAmount,
          totalPaid: calc.totalPaid,
          balanceAmount: calc.balanceAmount,
          settlementAmount: calc.balanceAmount,
          status: 'Settled',
          updatedAt: new Date(),
        }
      },
      { new: true, upsert: true }
    );

    // Synchronize the associated settlement payment record
    const settlementNotes = `Settlement for ${month}/${year}`;
    const existingPayment = await EmployeePayment.findOne({
      employeeId,
      paymentType: 'Settlement',
      notes: settlementNotes,
    });

    if (existingPayment) {
      existingPayment.amount = calc.balanceAmount;
      await existingPayment.save();
    } else if (calc.balanceAmount > 0) {
      await EmployeePayment.create({
        employeeId,
        date: new Date(),
        amount: calc.balanceAmount,
        paymentType: 'Settlement',
        notes: settlementNotes,
        createdBy: data.createdBy || 'Admin'
      });
    }

    return NextResponse.json({ ...updatedSettlement.toObject(), isPreview: false });
  } catch (error: any) {
    console.error('Error updating settlement:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!employeeId || !month || !year) {
      return NextResponse.json({ error: 'Missing employeeId, month, or year' }, { status: 400 });
    }

    await dbConnect();
    await EmployeeSettlement.findOneAndDelete({
      employeeId,
      month: Number(month),
      year: Number(year),
    });

    // Remove the associated settlement payment record so advances/payments revert to clean state
    await EmployeePayment.findOneAndDelete({
      employeeId,
      paymentType: 'Settlement',
      notes: `Settlement for ${month}/${year}`,
    });

    return NextResponse.json({ message: 'Settlement reset successfully' });
  } catch (error: any) {
    console.error('Error resetting settlement:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
