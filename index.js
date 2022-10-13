// how to validate email in js ?
const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

email("m.dd@gmail.com")

// how to push element in array ?
var arr = ["Hello", "World!"]
arr.push(arr);
console.log(arr);
console.log(arr[2]);

var arr = ["Hello", "World!"]
arr.push(arr.slice(0));
console.log(arr);



