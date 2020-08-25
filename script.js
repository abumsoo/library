function Book(title, author, pages) {
  this.title = title;
  this.author = author;
  this.pages = pages;
  this.readState = false;
}

Book.prototype.toggleRead = function() {
  this.readState = !this.readState;
};

function addBookToLibrary() {
  let title = prompt("Title");
  let author = prompt("Author");
  let pages = prompt("Number of pages");

  myLibrary.push(new Book(title, author, pages));
  populateStorage();

  renderCycle();
}

function render() {
  const shelf = document.querySelector(".shelf");
  shelf.innerHTML = "";

  for (let i = 0; i < myLibrary.length; i++) {
    const card = buildCard(myLibrary[i], i);
    shelf.appendChild(card);
  }
}

function buildCard(book, index) {
  const card = document.createElement("div");
  card.setAttribute("class", "card");
  card.setAttribute("data-index", `${index}`);

  const title = document.createElement("h2");
  title.innerHTML = book.title ? book.title : "";
  card.appendChild(title);

  const author = document.createElement("h3");
  author.innerHTML = book.author ? book.author : "";
  card.appendChild(author);

  const pages = document.createElement("p");
  pages.innerHTML = book.pages ? `Pages: ${book.pages}` : "";
  card.appendChild(pages);

  const btnContainer = document.createElement("div");
  btnContainer.setAttribute("class", "btn-container");

  const btnRead = buildButton("read", index);
  if (myLibrary[index].readState === true) {
    btnRead.style.color = 'green';
  }
  btnContainer.appendChild(btnRead);

  const btnDelete = buildButton("delete", index);
  btnContainer.appendChild(btnDelete);

  card.appendChild(btnContainer);

  return card;
}

function buildButton(type, index) {
  const button = document.createElement("button");
  button.setAttribute("class", `btn-${type}`);
  button.setAttribute("data-index", `${index}`);
  button.innerHTML = `${type}`;
  return button;
}

function deleteBook(e) {
  // delete book from library array
  let index = e.target.getAttribute('data-index');
  myLibrary.splice(index, 1);
  populateStorage();
  // delete book from the interface
  renderCycle();
}

function setRead(e) {
  let index = e.target.getAttribute('data-index');
  myLibrary[index].toggleRead();
  populateStorage();
  if (myLibrary[index].readState) {
    e.target.style.color = 'green';
  } else {
    e.target.style.color = 'black';
  }
}

function startAddButtonListener() {
  const btnAdd = document.querySelector(".add-button");
  btnAdd.addEventListener('click', addBookToLibrary);
}

function startReadButtonListeners() {
  const readBtns = document.querySelectorAll("button.btn-read");
  readBtns.forEach(button => button.addEventListener('click', setRead));
}

function startDeleteButtonListeners() {
  const delBtns = document.querySelectorAll("button.btn-delete");
  delBtns.forEach(button => button.addEventListener('click', deleteBook));
}

function renderCycle() {
  render();
  // if library exists
  if (myLibrary && myLibrary.length) {
    startDeleteButtonListeners();
    startReadButtonListeners();
  }
}

/*
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
 */
function storageAvailable(type) {
    var storage;
    try {
        storage = window[type];
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}

function populateLibrary() {
  let jsonObj = JSON.parse(localStorage.getItem('myLibrary'));
  for (let i = 0; i < jsonObj.length; i++) {
    let title = jsonObj[i].title;
    let author = jsonObj[i].author;
    let pages = jsonObj[i].pages;
    let read = jsonObj[i].read;
    myLibrary.push(new Book(title, author, pages, read));
  }
}

function populateStorage() {
  localStorage.setItem('myLibrary', JSON.stringify(myLibrary));
}

let myLibrary = [];

if (storageAvailable('localStorage')) {
  if(!localStorage.getItem('myLibrary')) {
    populateStorage();
  } else {
    populateLibrary();
  }
} else {
  myLibrary.push(new Book("Harry Potter", "J.K. Rowling", 239));
  myLibrary.push(new Book("Jurassic Park", "Michael Crichton", 214));
  myLibrary.push(new Book("Kafka on the Shore", "Haruki Murakami", 214));
}

renderCycle();
startAddButtonListener();
