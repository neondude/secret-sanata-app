document.addEventListener("alpine:init", () => {
  Alpine.store("user", UserObj);
  Alpine.store("groups", GroupsObj);
  Alpine.data("groupcreate", GroupCreateObj);
});

const GroupCreateObj = () => ({
  title: "",
  error_text: "",

  async validateAndSubmit() {
    var lettersAndSpaces = /^[a-zA-Z\s]*$/;
    try {
      if (lettersAndSpaces.test(this.title) && this.title.length >= 4) {
        this.error_text = "";

        //submit
        const response = await axios.put(
          "/server/secret_santa_2_function/group/create",
          {
            title: this.title,
          }
        );
        console.log(response);

        // add to GroupsList
        Alpine.store("groups").group_list.push(response.data);
        console.log("the group list ", Alpine.store("groups").group_list);
      } else {
        this.error_text = "Min Length 4. Only letters and Spaces";
      }
    } catch (error) {
      console.error(error);
      this.error_text = "Failed to create";
    }
  },
});

let GroupsObj = {
  group_list: [],

  getGroupList() {
    console.log(this.group_list);
    return this.group_list;
  },

  async init() {
    try {
      const response = await axios.get(
        "/server/secret_santa_2_function/user/groups"
      );
      console.log("responsedata group list init", response.data);
      // Alpine.store("groups").group_list.concat(response.data);
      this.group_list = response.data;
    } catch (error) {
      console.error(error);
    }
  },
};
