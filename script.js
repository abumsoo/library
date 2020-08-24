let myLibrary = [
  new Book("Kafka on the Shore", "Haruki Murakami"),
  new Book("Fight Club", "Chuck Palahniuk")
];

function Book(title, author) {
  this.title = title;
  this.author = author;
  this.read = false;
}

Book.prototype.toggleRead = function () { this.read = !this.read; }

function addBookToLibrary() {

  let title = prompt("Title");
  let author = prompt("Author");

  let book = new Book(title, author);

  myLibrary.push(book);

  clearShelf();

  render();
}

function render() {
  let i = 0;
  myLibrary.forEach(book => {

    const shelf = document.querySelector(".shelf");
    const card = document.createElement("div");
    card.setAttribute("class", "card");
    card.setAttribute("data-index", `${i}`);
    console.log(card);
    card.addEventListener('click', (e) => setPreview(e, book.title, book.author));

    const title = document.createElement("p");
    title.innerHTML = book.title;
    card.appendChild(title);

    const author = document.createElement("p");
    author.innerHTML = book.author;
    card.appendChild(author);

    const btnContainer = document.createElement("div");
    btnContainer.setAttribute("class", "btn-container");

    const btnRead = makeButton("read", i);
    btnRead.addEventListener('click', setRead);
    btnContainer.appendChild(btnRead);

    const btnDelete = makeButton("delete", i);
    btnDelete.addEventListener('click', deleteBook);
    btnContainer.appendChild(btnDelete);

    card.appendChild(btnContainer);

    shelf.appendChild(card);

    i++;

  });
}


function setPreview(e, title, author) {
  const preview = document.querySelector('.preview');
  // search for book
  let base = 'http://openlibrary.org/search.json?title='
  let coverURL = 'http://covers.openlibrary.org/b'
  let query = title.toLowerCase().replace(/\s/g, '+');
  // make author an array to check each name
  fetch(`${base}${query}`)
    .then(response => response.json())
    .then(data => {
      // return the id of the correct book
      for (doc in data.docs) {
        // check if item has the correct author
        // item.author array
        console.log(data.docs[doc].author_name);
        if (!('author_name' in data.docs[doc])) continue;
        if (data.docs[doc].author_name.find(a => a === author)) {
          return data.docs[doc].cover_i;
        }
      }
    })
    .then(id => {
      let imgURL = `${coverURL}/id/${id}-L.jpg`;
      console.log(imgURL);
      preview.style.backgroundImage = `url('${imgURL}')`;
    })
    .then(() => preview.style.boxShadow = '0 0 8px 0 rgba(0, 0, 0, 0.5)');
}

function makeButton(type, index) {
  const button = document.createElement("button");
  button.setAttribute("class", `btn-${type}`);
  button.setAttribute("data-index", `${index}`);
  button.innerHTML = `${type}`;
  return button;
}

function setRead(e) {
  let index = e.target.getAttribute('data-index');
  myLibrary[index].toggleRead();
  if (e.target.style.color !== 'green') {
    e.target.style.color = 'green';
  } else {
    e.target.style.color = 'black';
  }
}

function deleteBook(e) {
  let index = e.target.getAttribute('data-index');
  myLibrary.splice(index, 1);
  clearShelf();
  render();
}

function clearShelf() {
  // clear .shelf div to rerender with updates
  const shelf = document.querySelector('.shelf');
  shelf.innerHTML = "";
}

function startListeners() {
  // listen to the button to add new books to the library
  const btnAdd = document.querySelector(".add-button > button");
  btnAdd.addEventListener('click', addBookToLibrary);
}

startListeners();
render();
