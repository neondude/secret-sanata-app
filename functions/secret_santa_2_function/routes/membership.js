var catalyst = require("zcatalyst-sdk-node");

const canRequestMembership = async (catApp, group_id, user_id) => {
  const resObj = (canRequest, infoMsg, title) => {
    return {
      can_request: canRequest,
      info_msg: infoMsg,
      title: title == null ? "" : title,
    };
  };

  const groupMeta = await catApp
    .zcql()
    .executeZCQLQuery(
      `SELECT ROWID,hasBegun,title FROM GroupMeta where ROWID = ${group_id}`
    );

  if (groupMeta.length == 0) {
    //group meta record does not exist
    return resObj(false, "Group does not exist");
  } else if (groupMeta[0].GroupMeta.hasBegun) {
    // group has started secret santa
    return resObj(
      false,
      "Secret Santa has begun for this group",
      groupMeta[0].GroupMeta.title
    );
  }

  const groupMember = await catApp.zcql().executeZCQLQuery(
    `SELECT ROWID 
        FROM GroupMembers 
        where 
        GroupMetaID = ${group_id} and
        MemberUserID = ${user_id}`
  );

  if (groupMember.length > 0) {
    // user is already a member of this group
    return resObj(
      false,
      "Already a member of this group",
      groupMeta[0].GroupMeta.title
    );
  }

  const groupRequest = await catApp.zcql().executeZCQLQuery(
    `SELECT ROWID
      FROM GroupRequests 
      where 
      GroupMetaID = ${group_id} and 
      CREATORID = ${user_id}`
  );

  if (groupRequest.length > 0) {
    // user already requested to join the group
    return resObj(
      false,
      "Already requested to join the group",
      groupMeta[0].GroupMeta.title
    );
  }
  // user can request
  return resObj(
    true,
    "Request to join the group",
    groupMeta[0].GroupMeta.title
  );
};

// /group/membership/status/:group_id
const getMembershipStatus = async (req, res) => {
  try {
    const { group_id } = req.params;
    var catApp = catalyst.initialize(req);
    const userManagement = catApp.userManagement();
    const userDetails = await userManagement.getCurrentUser();
    let { can_request, info_msg, title } = await canRequestMembership(
      catApp,
      group_id,
      userDetails.user_id
    );

    res.status(200).json({
      can_request: can_request,
      info_msg: info_msg,
      title: title,
      res_msg: "success",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      res_msg: "error while getting membership status",
    });
  }
};
// /group/membership/request/:group_id
const requestMembership = async (req, res) => {
  try {
    const { group_id } = req.params;
    var catApp = catalyst.initialize(req);
    const userManagement = catApp.userManagement();
    const userDetails = await userManagement.getCurrentUser();
    let { can_request, info_msg, title } = await canRequestMembership(
      catApp,
      group_id,
      userDetails.user_id
    );
    if (can_request) {
      //create request record
      await catApp.zcql().executeZCQLQuery(
        `INSERT INTO GroupRequests VALUES 
          (
              ${group_id},
              '${userDetails.first_name + " " + userDetails.last_name}',
              '${userDetails.email_id}'
          ) `
      );
      res.status(200).json({
        group_id: group_id,
        res_msg: "success",
      });
    } else {
      res.status(400).json({
        res_msg: info_msg,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      res_msg: "error while getting membership status",
    });
  }
};

module.exports = { getMembershipStatus, requestMembership };
