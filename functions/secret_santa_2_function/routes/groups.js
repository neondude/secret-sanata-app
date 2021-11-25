var catalyst = require("zcatalyst-sdk-node");

const getGroups = async (req, res) => {
  // select GroupMeta.title , GroupMeta.ROWID from GroupMeta LEFT JOIN GroupMembers ON GroupMeta.ROWID = GroupMembers.group_id WHERE GroupMembers.
  var catApp = catalyst.initialize(req);
  const userManagement = catApp.userManagement();
  const userDetails = await userManagement.getCurrentUser();

  try {
    const getGroups = await catApp.zcql().executeZCQLQuery(
      `
        SELECT 
        GroupMeta.title, GroupMeta.ROWID
        from GroupMeta 
        LEFT JOIN GroupMembers
        ON GroupMeta.ROWID = GroupMembers.GroupMetaID
        WHERE GroupMembers.MemberUserID=${userDetails.user_id}`
    );
    const groupsRes = getGroups.map((item) => {
      return {
        title: item.GroupMeta.title,
        group_id: item.GroupMeta.ROWID,
      };
    });
    res.status(200).json(groupsRes);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      res_msg: "error in get groups",
    });
  }
};

module.exports = { getGroups };
