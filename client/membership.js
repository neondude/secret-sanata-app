document.addEventListener("alpine:init", () => {
  Alpine.store("user", UserObj);
  Alpine.data("membership", MembershipObj);
  Alpine.data("requestbtn", RequestBtn);
});

const RequestBtn = (group_id) => ({
  group_id: group_id,
  request_state: "START",

  async requestMembership() {
    this.request_state = "INPROGRESS";
    try {
      const response = await axios.get(
        "/server/secret_santa_2_function/group/membership/request/" +
          this.group_id
      );
      this.request_state = "SUCCESS";
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

const MembershipObj = () => ({
  group_id: null,
  can_request: false,
  title: "",
  info_msg: "loading..",

  async init() {
    try {
      let searchParams = new URLSearchParams(window.location.search);
      group_id_param = searchParams.get("group_id");
      const response = await axios.get(
        "/server/secret_santa_2_function/group/membership/status/" +
          group_id_param
      );
      this.group_id = group_id_param;
      console.log("membership status ", response.data);
      this.can_request = response.data.can_request;
      this.title = response.data.title;
      this.info_msg = response.data.info_msg;
    } catch (error) {
      console.log(error);
      this.info_msg = "error while loading membership data ";
    }
  },
});
