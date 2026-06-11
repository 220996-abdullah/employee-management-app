const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Employee App</title>

  <style>
    body{
      font-family: Arial;
      padding:40px;
      background:#f4f4f4;
    }

    input{
      padding:10px;
      margin:5px;
    }

    button{
      padding:10px 15px;
      cursor:pointer;
    }

    li{
      margin:10px 0;
      background:white;
      padding:10px;
      border-radius:5px;
    }
  </style>
</head>

<body>

<h1>Employee Management</h1>

<input id="name" placeholder="Enter Name">
<input id="position" placeholder="Enter Position">

<button onclick="addEmployee()">Add Employee</button>

<h2>Employees List</h2>

<ul id="list"></ul>

<script>

async function loadEmployees(){

  const response = await fetch('/api/employees');

  const data = await response.json();

  const list = document.getElementById('list');

  list.innerHTML = '';

  data.forEach(emp => {

    list.innerHTML +=
    \`<li>
      \${emp.name} - \${emp.position}

      <button onclick="editEmployee(\${emp.id}, '\${emp.name}', '\${emp.position}')">
        Edit
      </button>

      <button onclick="deleteEmployee(\${emp.id})">
        Delete
      </button>
    </li>\`;

  });
}

async function addEmployee(){

  const name = document.getElementById('name').value;

  const position = document.getElementById('position').value;

  await fetch('/api/employees',{

    method:'POST',

    headers:{
      'Content-Type':'application/json'
    },

    body: JSON.stringify({
      name,
      position
    })

  });

  loadEmployees();
}

async function deleteEmployee(id){

  await fetch('/api/employees/' + id, {
    method:'DELETE'
  });

  loadEmployees();
}

async function editEmployee(id, oldName, oldPosition){

  const name = prompt("Update Name", oldName);

  const position = prompt("Update Position", oldPosition);

  if(name === null || position === null) return;

  await fetch('/api/employees/' + id, {

    method:'PUT',

    headers:{
      'Content-Type':'application/json'
    },

    body: JSON.stringify({
      name,
      position
    })

  });

  loadEmployees();
}

loadEmployees();

</script>

</body>
</html>
`;

export default {

async fetch(request, env) {

const url = new URL(request.url);

// GET employees
if (url.pathname === "/api/employees" && request.method === "GET") {

const { results } = await env.DB.prepare(
"SELECT * FROM employees"
).all();

return Response.json(results);

}

// POST employee
if (url.pathname === "/api/employees" && request.method === "POST") {

const body = await request.json();

await env.DB.prepare(
"INSERT INTO employees (name, position) VALUES (?, ?)"
)

.bind(body.name, body.position)

.run();

return Response.json({ success: true });

}

// UPDATE employee
if (
url.pathname.startsWith("/api/employees/")
&& request.method === "PUT"
) {

const id = url.pathname.split("/").pop();

const body = await request.json();

await env.DB.prepare(
"UPDATE employees SET name = ?, position = ? WHERE id = ?"
)

.bind(body.name, body.position, id)

.run();

return Response.json({ success: true });

}

// DELETE employee
if (
url.pathname.startsWith("/api/employees/")
&& request.method === "DELETE"
) {

const id = url.pathname.split("/").pop();

await env.DB.prepare(
"DELETE FROM employees WHERE id = ?"
)

.bind(id)

.run();

return Response.json({ success: true });

}

// Frontend webpage
return new Response(html, {

headers: {
"content-type": "text/html;charset=UTF-8"
},

});

},
}
