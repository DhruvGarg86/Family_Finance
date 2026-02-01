const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Family = require("./models/Family");
const Member = require("./models/Member");
const Transaction = require("./models/Transaction");

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
