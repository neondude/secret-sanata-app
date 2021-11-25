var catalyst = require("zcatalyst-sdk-node");
const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} = require("unique-names-generator");

const createGroup = async (req, res) => {
  var catApp = catalyst.initialize(req);
  const userManagement = catApp.userManagement();
  const userDetails = await userManagement.getCurrentUser();
  const { title } = req.body;
  //TODO title validation
  //TODO limit 5 groups

  // const randomName = uniqueNamesGenerator({
  //   dictionaries: [adjectives.concat(colors), animals],
  //   separator: "_",
  //   length: 2,
  //   style: "capital",
  // });

  try {
    let fullName = userDetails.first_name + " " + userDetails.last_name;
    const createMeta = await catApp
      .zcql()
      .executeZCQLQuery(
        `INSERT INTO GroupMeta VALUES ('${title}', false, false)`
      );

    let createGroupQuery = `
      INSERT INTO GroupMembers 
      VALUES
      (
        ${createMeta[0].GroupMeta.ROWID},
        ${createMeta[0].GroupMeta.CREATORID},
        true,
        '${fullName}',
        null,
        null,
        null
        )
    `;

    await catApp.zcql().executeZCQLQuery(createGroupQuery);

    res.status(200).json({
      title: createMeta[0].GroupMeta.title,
      group_id: createMeta[0].GroupMeta.ROWID,
      res_msg: "success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      res_msg: "error in put group",
    });
  }
};

const getGroup = async (req, res) => {
  const { group_id } = req.params;
  var catApp = catalyst.initialize(req);
  const userManagement = catApp.userManagement();
  const userDetails = await userManagement.getCurrentUser();

  try {
    const groupQueryRes = await catApp
      .zcql()
      .executeZCQLQuery(
        `SELECT title,isRevealed,hasBegun FROM GroupMeta where ROWID = ${group_id}`
      );

    //does group exist?
    if (groupQueryRes.length == 0) {
      res.status(400).json({
        res_msg: "group does not exist",
      });
      return;
    }

    const groupMemberQuery = await catApp
      .zcql()
      .executeZCQLQuery(
        `select isAdmin from GroupMembers where GroupMetaID = ${group_id} and MemberUserID = ${userDetails.user_id}`
      );

    //is user part of group?
    if (groupMemberQuery.length == 0) {
      res.status(400).json({
        res_msg: "user is not member of group",
      });
      return;
    }

    res.status(200).json({
      title: groupQueryRes[0].GroupMeta.title,
      is_admin: groupMemberQuery[0].GroupMembers.isAdmin,
      is_revealed: groupQueryRes[0].GroupMeta.isRevealed,
      has_begun: groupQueryRes[0].GroupMeta.hasBegun,
      group_id: groupQueryRes[0].GroupMeta.ROWID,
      res_msg: "success",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      res_msg: "error in fetching group details",
    });
  }
};

const getGroupRequests = async (req, res) => {
  const { group_id } = req.params;
  var catApp = catalyst.initialize(req);
  const userManagement = catApp.userManagement();
  const userDetails = await userManagement.getCurrentUser();

  try {
    const groupMemberQuery = await catApp
      .zcql()
      .executeZCQLQuery(
        `select isAdmin from GroupMembers where GroupMetaID = ${group_id} and MemberUserID = ${userDetails.user_id}`
      );

    //is user part of group?
    if (groupMemberQuery.length == 0) {
      res.status(400).json({
        res_msg: "user is not member of group",
      });
      return;
    }

    if (!groupMemberQuery[0].GroupMembers.isAdmin) {
      res.status(400).json({
        res_msg: "user is not an admin of the group",
      });
      return;
    }

    const groupRequestsQuery = await catApp
      .zcql()
      .executeZCQLQuery(
        `select UserFullName,CREATORID from GroupRequests where GroupMetaID = ${group_id}`
      );
    const requestListRes = groupRequestsQuery.map((item) => {
      return {
        user_id: item.GroupRequests.CREATORID,
        full_name: item.GroupRequests.UserFullName,
        email_id: item.GroupRequests.UserEmail,
        res_msg: "success",
      };
    });
    res.status(200).json(requestListRes);
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      res_msg: "error in fetching group requests",
    });
  }
};

const getGroupMembers = async (req, res) => {
  const { group_id } = req.params;
  var catApp = catalyst.initialize(req);
  const userManagement = catApp.userManagement();
  const userDetails = await userManagement.getCurrentUser();

  try {
    const groupMetaQuery = await catApp
      .zcql()
      .executeZCQLQuery(
        `select isRevealed,hasBegun from GroupMeta where ROWID = ${group_id}`
      );

    if (groupMetaQuery.length == 0) {
      res.status(400).json({
        res_msg: "group does not exist",
      });
      return;
    }

    const isMemberQuery = await catApp
      .zcql()
      .executeZCQLQuery(
        `select ROWID from GroupMembers where MemberUserID= ${userDetails.user_id} and GroupMetaID=${group_id}`
      );

    if (isMemberQuery.length == 0) {
      res.status(400).json({
        res_msg: "user not member of group",
      });
      return;
    }

    // if create phase
    if (
      !groupMetaQuery[0].GroupMeta.hasBegun &&
      !groupMetaQuery[0].GroupMeta.isRevealed
    ) {
      const openMemberListQuery = await catApp
        .zcql()
        .executeZCQLQuery(
          `select MemberUserID,isAdmin,MemberFullName from GroupMembers where GroupMetaID=${group_id}`
        );
      const groupListRes = openMemberListQuery.map((item) => {
        return {
          user_id: item.GroupMembers.MemberUserID,
          is_admin: item.GroupMembers.isAdmin,
          full_name: item.GroupMembers.MemberFullName,
          res_msg: "success",
        };
      });
      res.status(200).json(groupListRes);
      return;
    }
    // if play phase
    else if (
      groupMetaQuery[0].GroupMeta.hasBegun &&
      !groupMetaQuery[0].GroupMeta.isRevealed
    ) {
    }
    // if reveal phase
    else if (
      groupMetaQuery[0].GroupMeta.hasBegun &&
      groupMetaQuery[0].GroupMeta.isRevealed
    ) {
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      res_msg: "error in fetching group members",
    });
  }
};

const acceptMember = async (req, res) => {
  const { group_id, user_id } = req.params;
  var catApp = catalyst.initialize(req);
  const userManagement = catApp.userManagement();
  const userDetails = await userManagement.getCurrentUser();

  try {
    //TODO check group game started or ended

    const groupAdminQuery = await catApp
      .zcql()
      .executeZCQLQuery(
        `select isAdmin from GroupMembers where MemberUserID = ${userDetails.user_id}`
      );

    if (groupAdminQuery.length == 0) {
      res.status(400).json({
        res_msg: "you are not an admin of this group",
      });
      return;
    }

    const memberRequestQuery = await catApp
      .zcql()
      .executeZCQLQuery(
        `select ROWID from GroupRequests where CREATORID = ${user_id}`
      );

    if ((memberRequestQuery.length = 0)) {
      res.status(400).json({
        res_msg: "user has not requested to join",
      });
      return;
    }

    const requestorDetails = await userManagement.getUserDetails(user_id);

    await catApp.zcql().executeZCQLQuery(
      `
      INSERT INTO GroupMembers 
      VALUES
      (
        ${group_id},
        ${user_id},
        false,
        '${requestorDetails.first_name + " " + requestorDetails.last_name}',
        null,
        null,
        null
        )
    `
    );

    //delete request
    await catApp
      .zcql()
      .executeZCQLQuery(
        `delete from GroupRequests where CREATORID = ${user_id} and GroupMetaID =${group_id}`
      );

    res.status(200).json({
      res_msg: "success",
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      res_msg: "failed to accept request",
    });
  }
};

module.exports = {
  createGroup,
  getGroup,
  getGroupMembers,
  getGroupRequests,
  acceptMember,
};
