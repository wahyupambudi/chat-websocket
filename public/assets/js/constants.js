// public/assets/js/constants.js

export let ws = null;
export let myUserName = "";
export let currentRecipient = "#public";

export let currentGroupMembers = {}; // Key: groupName, Value: Array of member userNames

export function setWs(newWs) {
  ws = newWs;
}

export function setMyUserName(newName) {
  myUserName = newName;
}

export function setCurrentRecipient(newRecipient) {
  currentRecipient = newRecipient;
}

export function setCurrentGroupMembers(membersData) {
  currentGroupMembers = membersData;
}
