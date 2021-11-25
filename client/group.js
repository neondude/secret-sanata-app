document.addEventListener("alpine:init", () => {
  Alpine.store("user", UserObj);
  Alpine.store("groupdata", GroupData);
  Alpine.data("memberlist", MemberList);
  Alpine.data("requestlist", RequestList);
  Alpine.data("requestlistitem", RequestListItem);
});

const RequestListItem = (group_id, user_id, successCallback) => ({
  group_id: group_id,
  user_id: user_id,
  successCallback: successCallback,
  request_state: "START",

  async acceptMember() {
    this.request_state = "INPROGRESS";
    try {
      const response = await axios.get(
        "/server/secret_santa_2_function/group/request/accept/" +
          this.group_id +
          "/" +
          this.user_id
      );
      console.log(response.data);
      this.request_state = "SUCCESS";
      successCallback(user_id);
    } catch (error) {
      this.request_state = "FAIL";
    }
  },

  isBtnDisabled() {
    return this.request_state != "START";
  },

  getButtonContent() {
    switch (this.request_state) {
      case "START":
        return "Request";
      case "INPROGRESS":
        return `<span class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </span>`;
      case "SUCCESS":
        return "Requested";
      case "FAIL":
        return "Error";
      default:
        return "Error";
    }
  },
});

const RequestList = () => ({
  request_list: [],
  group_id: null,

  async loadRequestList() {
    try {
      this.request_list = [];
      let searchParams = new URLSearchParams(window.location.search);
      let group_id_param = searchParams.get("group_id");
      const response = await axios.get(
        "/server/secret_santa_2_function/group/requests/" + group_id_param
      );
      console.log("request list ", response.data);
      this.request_list = response.data;
      this.group_id = group_id_param;
    } catch (error) {
      console.log(error);
    }
  },

  onAccept(user_id) {
    console.log("onAccept", user_id, this.request_list);
    this.request_list = [];

    this.request_list = this.request_list.filter((listItem) => {
      console.log(listItem, user_id, listItem.user_id != user_id);
      return listItem.user_id != user_id;
    });
  },
});

const MemberList = () => ({
  member_list: [],

  async init() {
    // await this.loadMemberList();
  },

  async loadMemberList() {
    try {
      this.member_list = [];
      let searchParams = new URLSearchParams(window.location.search);
      let group_id_param = searchParams.get("group_id");
      const response = await axios.get(
        "/server/secret_santa_2_function/group/members/" + group_id_param + "/1"
      );
      console.log("member list ", response.data);
      this.member_list = response.data;
    } catch (error) {
      console.log(error);
    }
  },
});

const GroupData = {
  group_id: null,
  info_msg: "loading..",
  title: null,
  is_admin: false,
  has_begun: false,
  is_revealed: false,

  async init() {
    try {
      let searchParams = new URLSearchParams(window.location.search);
      let group_id_param = searchParams.get("group_id");
      const response = await axios.get(
        "/server/secret_santa_2_function/group/details/" + group_id_param
      );
      console.log("responsedata group data init", response.data);
      this.group_id = group_id_param;
      this.title = response.data.title;
      this.is_admin = response.data.is_admin;
      this.has_begun = response.data.has_begun;
      this.is_revealed = response.data.is_revealed;
      this.info_msg = null;
    } catch (error) {
      console.error(error);
      this.info_msg = "error loading group data";
    }
  },
};
