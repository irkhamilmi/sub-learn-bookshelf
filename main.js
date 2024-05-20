const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOK_APPS";

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBOOKS = document.getElementById("incompleteBookshelfList");
  uncompletedBOOKS.innerHTML = "";

  const completedBOOKS = document.getElementById("completeBookshelfList");
  completedBOOKS.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isComplete) {
      completedBOOKS.append(bookElement);
    } else {
      uncompletedBOOKS.append(bookElement);
    }
  }
});

function addBook() {
  const textBook = document.getElementById("inputBookTitle").value;
  const authorBook = document.getElementById("inputBookAuthor").value;
  const yearBook = document.getElementById("inputBookYear").value;

  const isChecked = document.getElementById("inputBookIsComplete").checked;
  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    textBook,
    authorBook,
    yearBook,
    isChecked
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBook();
}

function generateId() {
  return +new Date();
}
//submit ulang karena yang tadinya year STRING sudah menjadi NUMBER
function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year: parseInt(year),
    isComplete,
  };
}

function makeBook(bookObject) {
  const { title, author, year } = bookObject;
  const textBook = document.createElement("h3");
  textBook.innerText = title;

  const authorBook = document.createElement("p");
  authorBook.innerText = `Author: ${author}`;

  const yearBook = document.createElement("p");
  yearBook.innerText = `Year: ${year}`;

  const action = document.createElement("div");
  action.classList.add("action");

  const artikel = document.createElement("article");
  artikel.classList.add("book_item");
  artikel.setAttribute("id", bookObject.id);
  artikel.append(textBook, authorBook, yearBook, action);

  const check = document.getElementById("inputBookIsComplete");
  if (!check.checked) {
    const notComplete = document.getElementById("incompleteBookshelfList");
    notComplete.append(artikel);
  } else {
    const completeBook = document.getElementById("completeBookshelfList");
    completeBook.append(artikel);
  }

  if (bookObject.isComplete) {
    const undo = document.createElement("button");
    undo.innerText = " belum selesai dibaca";
    undo.classList.add("green");

    undo.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);
    });

    const delet = document.createElement("button");
    delet.innerText = "hapus buku";
    delet.classList.add("red");

    delet.addEventListener("click", function () {
      deleteBook(bookObject.id);
    });

    action.append(undo, delet);
  } else {
    const checkButon = document.createElement("button");
    checkButon.innerText = "selesai dibaca";
    checkButon.classList.add("green");
    checkButon.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });

    const deletButton = document.createElement("button");
    deletButton.innerText = "hapus buku";
    deletButton.classList.add("red");
    deletButton.addEventListener("click", function () {
      deleteBook(bookObject.id);
    });
    action.append(checkButon, deletButton);
  }
  return artikel;
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;
  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBook();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function deleteBook(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBook();
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;
  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBook();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function saveBook() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("brpwser kamu todak mendukung local storage");
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log("data berhasil disimpan");
});

function loadDataFromStorage() {
  const serialzedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serialzedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

document
  .getElementById("searchBook")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const searchBook = document
      .getElementById("searchBookTitle")
      .value.toLowerCase();
    const bookData = document.querySelectorAll(".book_item > h3");
    for (const book of bookData) {
      if (book.innerText.toLowerCase().includes(searchBook)) {
        book.parentElement.style.display = "block";
      } else {
        book.parentElement.style.display = "none";
      }
    }
  });
