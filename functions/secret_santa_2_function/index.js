"use strict";
var express = require("express");
const {
  createGroup,
  getGroup,
  getGroupMembers,
  getGroupRequests,
  acceptMember,
} = require("./routes/group");
const { getGroups } = require("./routes/groups");
const {
  getMembershipStatus,
  requestMembership,
} = require("./routes/membership");

var app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.put("/group/create", createGroup);
app.get("/group/details/:group_id", getGroup);
app.get("/group/members/:group_id/:page_no", getGroupMembers);

app.get("/group/requests/:group_id", getGroupRequests);
app.get("/group/request/accept/:group_id/:user_id", acceptMember);

app.get("/group/membership/request/:group_id", requestMembership);
app.get("/group/membership/status/:group_id", getMembershipStatus);

app.get("/user/groups", getGroups);

module.exports = app;
