import { useFetch } from "./client";
const fetchTodo = async () => {
    const res = await fetch('https://jsonplaceholder.typicode.com/todos', {
        method: "POST",
        body: JSON.stringify("HI")
    });
    return res.json();
};
const main = async () => {
    useFetch('todo', 'https://jsonplaceholder.typicode.com/todos').subscribe(value => console.log(value));
    setTimeout(() => {
        useFetch('todo', 'https://jsonplaceholder.typicode.com/todos').subscribe(value => console.log(value));
    }, 3000);
};
main();
export { useFetch };
//# sourceMappingURL=main.js.map