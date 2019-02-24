# &lt;comic-reader&gt;

> ___Note___: This component is in very early development and should not be used in production.

A comic reader as a web component. Usage is as simple as:

```html
<comic-reader src="https://example.com/whiz-comics-01.cbz"></comic-reader>
```

## Install

Using Yarn:

```shell
yarn add comic-reader
```

npm:

```shell
npm install comic-reader
```

## API

### Attributes / Properties

Every attribute is also available as a property (and vice versa). Here are the properties for configuring the reader:

#### src

There are 2 forms, a string URL (relative to the `document.baseURI`) and an object. Here are how they are used:

```html
<comic-reader src="./whiz-comics-01.cbz"></comic-reader>
```

Alternatively this can be set by a property:

```js
let reader = document.querySelector('comic-reader');
reader.src = './whiz-comics-01-cbz';
```

This will fetch `whiz-comics-01.cbz` and extract the comic into the reader. The supported formats are:

* __cbz__: A zip archive. Extension does not matter.
* __cbr__: A rar archive. Extension does not matter.

#### page

Set the page. This will navigate to that page immediately. This is useful, for example, to restore the page that the user was previously reading.

```html
<comic-reader src="./whiz-comics-01.cbz" page="8"></comic-reader>
```

Alternatively set via a property:

```js
let reader = document.querySelector('comic-reader');
reader.page = 18;
```

### Events

These events are emitted:

#### page

This event is emitted as pages are navigated. You might use this, for example, to store the current page in order to restore it later.

```js
let reader = document.querySelector('comic-reader');

reader.addEventListener('page', ev => {
  let page = ev.detail;
  
  // Do something with the page...
});
```

## License 

BSD-2-Clause