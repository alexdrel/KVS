interface User {
    name: string;
}

type Users = { *: User };

const users: Users = {
    ada: { name: "Ada Lovelace" },
    grace: { name: "Grace Hopper" },
};

for (users) {
    console.log(`${#}: ${_.name}`);
}

// ada: Ada Lovelace
// grace: Grace Hopper
