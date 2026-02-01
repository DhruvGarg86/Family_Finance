const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Family = require("./models/Family");
const Member = require("./models/Member");
const Transaction = require("./models/Transaction");
const RecurringIncome = require("./models/RecurringIncome");


const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://dhruvgarg086_db_user:NgZ30b8pO2utqiXG@cluster0.kekvewg.mongodb.net/familyDB?retryWrites=true&w=majority")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("Family Finance Backend Running");
});


// ✅ Create Family (Run once manually)
app.post("/setup-family", async (req, res) => {
  const { familyName, pin } = req.body;
  const family = new Family({ familyName, familyPinHash: pin });
  await family.save();
  res.send("Family Created");
});

// ✅ Get Family Details
app.get("/family", async (req, res) => {
  const family = await Family.findOne();
  res.send(family);
});

// Get All Members
app.get("/members", async (req, res) => {
  const members = await Member.find();
  res.send(members);
});

// Delete Member
app.delete("/delete-member/:id", async (req, res) => {
  await Member.findByIdAndDelete(req.params.id);
  res.send("Member Deleted");
});



// ✅ Add Member
app.post("/add-member", async (req, res) => {
  const { familyId, name } = req.body;
  const member = new Member({ familyId, name });
  await member.save();
  res.send(member);
});

// ✅ Rename Member
app.put("/rename-member", async (req, res) => {
  const { memberId, newName } = req.body;
  await Member.findByIdAndUpdate(memberId, { name: newName });
  res.send("Name Updated");
});

// ✅ Add Transaction
app.post("/add-transaction", async (req, res) => {
  const data = req.body;

  if (data.addedBy === data.forMember) {
    data.status = "Approved";
    data.approvedBy = data.addedBy;
  } else {
    data.status = "Pending";
    data.approvalRequiredFrom = data.forMember;
  }

  const txn = new Transaction(data);
  await txn.save();
  res.send(txn);
});

// ✅ Get Pending Approvals
app.get("/pending/:member", async (req, res) => {
  const txns = await Transaction.find({
    approvalRequiredFrom: req.params.member,
    status: "Pending"
  });
  res.send(txns);
});

// ✅ Approve
app.put("/approve/:id", async (req, res) => {
  await Transaction.findByIdAndUpdate(req.params.id, {
    status: "Approved",
    approvedBy: req.body.member
  });
  res.send("Approved");
});

// ✅ Reject
app.put("/reject/:id", async (req, res) => {
  await Transaction.findByIdAndUpdate(req.params.id, {
    status: "Rejected",
    approvedBy: req.body.member
  });
  res.send("Rejected");
});

// ✅ Verify Family PIN
app.post("/verify-pin", async (req, res) => {
  const { pin } = req.body;

  const family = await Family.findOne();

  if (!family) {
    return res.status(404).json({ success: false });
  }

  if (family.familyPinHash === pin) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});
// Get Transactions for a Member
app.get("/transactions/:member", async (req, res) => {
  const txns = await Transaction.find({
    $or: [
      { addedBy: req.params.member },
      { forMember: req.params.member }
    ]
  }).sort({ createdAt: -1 });

  res.send(txns);
});
// Financial Summary for Member
app.get("/summary/:member", async (req, res) => {
  const member = req.params.member;

  const sumByType = async (type) => {
    const result = await Transaction.aggregate([
      { $match: { forMember: member, type: type, status: "Approved" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    return result[0]?.total || 0;
  };

  const income = await sumByType("Income");
  const expense = await sumByType("Expense");
  const savings = await sumByType("Saving");
  const investments = await sumByType("Investment");

  res.json({
    income,
    expense,
    savings,
    investments,
    balance: income - expense
  });
});
app.get("/recent/:member", async (req, res) => {
  const txns = await Transaction.find({ forMember: req.params.member })
    .sort({ createdAt: -1 })
    .limit(5);

  res.send(txns);
});

// Add Recurring Income
app.post("/recurring", async (req, res) => {
  const recurring = new RecurringIncome(req.body);
  await recurring.save();
  res.send(recurring);
});

// Get Recurring Incomes for Member
app.get("/recurring/:member", async (req, res) => {
  const list = await RecurringIncome.find({ member: req.params.member });
  res.send(list);
});

// Mark Recurring Income as Received
app.put("/recurring/received/:id", async (req, res) => {
  const recurring = await RecurringIncome.findById(req.params.id);
  recurring.lastReceived = new Date();
  await recurring.save();

  // Automatically add income transaction
  await Transaction.create({
    familyId: req.body.familyId,
    amount: recurring.amount,
    type: "Income",
    category: "Recurring",
    source: recurring.title,
    target: "Self",
    paymentMode: "Bank",
    bankName: "",
    addedBy: recurring.member,
    forMember: recurring.member,
    status: "Approved",
    approvedBy: recurring.member
  });

  res.send("Marked as received");
});
app.get("/profile/:member", async (req, res) => {
  const total = await Transaction.countDocuments({ forMember: req.params.member });
  const pending = await Transaction.countDocuments({
    approvalRequiredFrom: req.params.member,
    status: "Pending"
  });

  const member = await Member.findOne({ name: req.params.member });

  res.json({
    totalTransactions: total,
    pendingApprovals: pending,
    joinedDate: member?.createdAt
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
