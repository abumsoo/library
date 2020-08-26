function Book(title, author, pages, read = false) {
  this.title = title;
  this.author = author;
  this.pages = pages;
  this.readState = read;
}

Book.prototype.toggleRead = function() {
  this.readState = !this.readState;
};

function addBookToLibrary() {
  let title = document.getElementById("new-title").value;
  let author = document.getElementById("new-author").value;
  let pages = document.getElementById("new-pages").value

  let book = new Book(title, author, pages);
  myLibrary.push(book);

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
  // group card
  const card = document.createElement("div");
  card.setAttribute("class", "card");
  card.setAttribute("data-index", `${index}`);

  // group just the text into a container
  const textContainer = document.createElement("div");
  textContainer.setAttribute("class", "text-container");
  card.appendChild(textContainer);

  const title = document.createElement("h2");
  title.innerHTML = book.title ? book.title : "";
  textContainer.appendChild(title);

  const author = document.createElement("h3");
  author.innerHTML = book.author ? book.author : "";
  textContainer.appendChild(author);

  const pages = document.createElement("p");
  pages.innerHTML = book.pages ? `${book.pages} pages` : "";
  textContainer.appendChild(pages);

  // group buttons into a container
  const btnContainer = document.createElement("div");
  btnContainer.setAttribute("class", "btn-container");

  const btnRead = buildButton("read", index);
  if (myLibrary[index].readState === true) {
    btnRead.classList.add('read');
  } else {
    btnRead.classList.remove('read');
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

  if (type === 'delete') {
    button.innerHTML = '<i class="fa fa-trash" aria-hidden="true"></i>'
  } else if (type === 'read') {
    button.innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>'
  }
  return button;
}

function deleteBook(e) {
  e.stopPropagation();
  // delete book from library array
  let index = e.target.getAttribute('data-index');
  myLibrary.splice(index, 1);
  populateStorage();
  // delete book from the interface
  renderCycle();
}

function setRead(e) {
  e.stopPropagation();
  let index = e.target.getAttribute('data-index');
  myLibrary[index].toggleRead();
  populateStorage();
  if (myLibrary[index].readState) {
    e.target.classList.add('read');
  } else {
    e.target.classList.remove('read');
  }
}

function startFormListener() {
  const btnAdd = document.querySelector(".add-button");
  btnAdd.addEventListener('click', openForm);
  const cancel = document.querySelector("#popup-form #cancel");
  cancel.addEventListener('click', closeForm);
  const submit = document.querySelector("#popup-form #submit");
  submit.addEventListener('click', addBookToLibrary);
}

function startReadButtonListeners() {
  const readBtns = document.querySelectorAll("button.btn-read");
  readBtns.forEach(button => button.addEventListener('click', setRead));
}

function startDeleteButtonListeners() {
  const delBtns = document.querySelectorAll("button.btn-delete");
  delBtns.forEach(button => button.addEventListener('click', deleteBook));
}

function startCardListeners() {
  const cards = document.querySelectorAll(".card");
  cards.forEach(card => card.addEventListener('click', (e) => {
    setPreview(e);
    const clickedCard = document.querySelector(".card-clicked");
    if (clickedCard) {
      clickedCard.classList.remove('card-clicked');
    }
    e.target.classList.add('card-clicked');
  }));
}

function renderCycle() {
  render();
  // if library exists
  if (myLibrary && myLibrary.length) {
    startDeleteButtonListeners();
    startReadButtonListeners();
    startCardListeners();
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
    let read = jsonObj[i].readState;
    let book = new Book(title, author, pages, read);
    myLibrary.push(book);
  }
  populateStorage();
}

function populateStorage() {
  localStorage.setItem('myLibrary', JSON.stringify(myLibrary));
}

function setPreview(e) {
  const preview = document.querySelector('.preview');

  // get info from clicked card
  let title = myLibrary[e.target.getAttribute('data-index')].title;
  let author = myLibrary[e.target.getAttribute('data-index')].author;

  let coverURL = 'http://covers.openlibrary.org/b'
  getOpenLibraryInfo(author, title)
    .then(info => {
      let imgURL = `${coverURL}/id/${info.cover_i}-L.jpg`;
      preview.style.backgroundImage = `url('${imgURL}')`;
    })
    .then(() => preview.style.boxShadow = '0 0 8px 8px rgba(255, 255, 255, 0.9)');
}


function getOpenLibraryInfo(author, title) {
  // build search query
  author = author.toLowerCase();
  let base = 'http://openlibrary.org/search.json?title='
  let query = title.toLowerCase().replace(/\s/g, '+');
  let results = fetch(`${base}${query}`)
    .then(response => response.json())
    .then(data => {
      // return the id of the correct book
      for (doc in data.docs) {
        // check if item has the correct author
        if (!('author_name' in data.docs[doc])) {
          continue;
        }
        let possibleNames = data.docs[doc].author_name.map(a => a.toLowerCase());
        if (possibleNames.find(a => a === author)) {
          return data.docs[doc];
        }
      }
    });
  return results;
}

function openForm() {
  document.querySelector(".form-container").style.display = "grid";
  document.getElementById("popup-form").style.display = "grid";
}

function closeForm() {
  document.getElementById("popup-form").style.display = "none";
  document.querySelector(".form-container").style.display = "none";
  document.querySelector("form#popup-form").reset();
}

let myLibrary = [];

if (storageAvailable('localStorage')) {
  if(!localStorage.getItem('myLibrary')) {
    populateStorage();
  } else {
    populateLibrary();
  }
} else {
  myLibrary.push(new Book("Harry Potter", "J.K. Rowling"));
  myLibrary.push(new Book("Jurassic Park", "Michael Crichton"));
  myLibrary.push(new Book("Kafka on the Shore", "Haruki Murakami"));
}

renderCycle();
startFormListener();
