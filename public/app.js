let todos = [];

const $todos = document.querySelector('.todos');
const $inputTodo = document.querySelector('.input-todo');
const $todoForm = document.querySelector('.todoForm');
const $checkbox = document.querySelector('.checkbox');
const $completedTodos = document.querySelector('.completed-todos');
const $activeTodos = document.querySelector('.active-todos');
const $btn = document.querySelector('.btn');
const $nav = document.querySelector('.nav');
const $all = document.querySelector('#all');
const $active = document.querySelector('#active');
const $completed = document.querySelector('#completed');

const render = () => {
  let renderTodos = [];
  if ($all.classList.contains('active')) {
    renderTodos = todos;
  } else if ($active.classList.contains('active')) {
    renderTodos = todos.filter(todo => todo.completed === true);
  } else if($completed.classList.contains('active')) {
    renderTodos = todos.filter(todo => todo.completed === false);
  }
  $todos.innerHTML = renderTodos.map((todo) => `<li id=${todo.id} class="todo-item">
  <input id=ck-${todo.id} class="checkbox" type="checkbox" ${todo.completed ? 'checked' : ''}>
  <label for=ck-${todo.id} ${todo.completed ? "style='text-decoration: line-through'" : ''}>${todo.content}</label>
  <i class="remove-todo far fa-times-circle"></i>
  </li> 
  `).join('');

  $completedTodos.textContent = todos.filter(todo => todo.completed === true).length;
  $activeTodos.textContent = todos.length - $completedTodos.textContent;
};

const fetchTodos = () => {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', '/todos');
  xhr.send();
  xhr.onload = () => {
    if (xhr.status === 200) {
      todos = JSON.parse(xhr.response);
      todos = todos.sort((todo1, todo2) => todo1.id - todo2.id);

      render();
    } else {
      console.error('Error', xhr.status, xhr.statusText);
    }
  };
};

$todos.addEventListener('change', (e) => {
  const todo = todos.find(todo => +e.target.parentNode.id === todo.id);
  const xhr = new XMLHttpRequest();
  xhr.open('PATCH', `/todos/${e.target.parentNode.id}`);
  xhr.setRequestHeader('content-type', 'application/json');
  xhr.send(JSON.stringify({ completed: !todo.completed }));
  todos = todos.map((todo) => {
    if (+e.target.parentNode.id === todo.id) {
      todo.completed = !todo.completed;
    }
    return todo;
  });
  xhr.onload = () => {
    if(xhr.status === 200) {
      render();
    } else {
      console.error('Error', xhr.status, xhr.statusText);
    }
  };
});

const addTodo = content => {
  const todo = {
    id: todos.length ? Math.max(...todos.map(todo => todo.id)) + 1 : 1,
    content, completed: false,
  };

  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/todos');
  xhr.setRequestHeader('content-type', 'application/json');
  xhr.send(JSON.stringify(todo));
  xhr.onload = () => {
    if (xhr.status === 200 || xhr.status === 201) {
      todos = [JSON.parse(xhr.response), ...todos];
      render();
    } else {
      console.error('Error', xhr.status, xhr.statusText);
    }
  };
};

$todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if ($inputTodo.value === '' || !$inputTodo.value.trim().length) return;
  const content = $inputTodo.value;
  addTodo(content);
  $inputTodo.value = '';
});

$todos.addEventListener('click', (e) => {
  if (!e.target.matches('.todo-item > .remove-todo')) return;
  const xhr = new XMLHttpRequest();
  xhr.open('DELETE', `/todos/${e.target.parentNode.id}`);
  xhr.send();
  xhr.onload = () => {
    if (xhr.status === 200) {
      todos = todos.filter((todo) => +e.target.parentNode.id !== todo.id);

      render();
    } else {
      console.error('Error', xhr.status, xhr.statusText);
    }
  };
});

$checkbox.addEventListener('change', e => {
  todos.forEach(todo => {
    const xhr = new XMLHttpRequest();
    xhr.open('PATCH', `/todos/${todo.id}`);
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.send(JSON.stringify({ completed: $checkbox.checked }));
    xhr.onload = () => {
      if (xhr.status === 200) {
        todos = todos.map(todo => ({ ...todo, completed: $checkbox.checked }));
        render();
      } else {
        console.error('Error', xhr.status, xhr.statusText);
      }
    };
  });
});

$btn.addEventListener('click', () => {
  const todoDelete = todos.filter(todo => todo.completed === true);
  todoDelete.forEach(todo => {
    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', `/todos/${todo.id}`);
    xhr.send();
    xhr.onload = () => {
      if (xhr.status === 200) {
        todos = todos.filter(todo => todo.completed === false);
        render();
      } else {
        console.error('Error', xhr.status, xhr.statusText);
      }
    };
  });
});

$nav.addEventListener('click', (e) => {
  const navChild = [...$nav.children];
  const targetId = e.target.id;
  navChild.forEach((li) => {
    targetId === li.id ? e.target.classList.add('active') : li.classList.remove('active');
  });
  render();
});

document.addEventListener('DOMContentLoaded', fetchTodos);
