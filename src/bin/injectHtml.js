const setAttributes = (element, attributes) => {
  attributes.forEach(({ type, value }) => {
    element.setAttribute(type, value);
  });
};
const appendChildren = (element, children) => children.forEach(el => element.append(el));

const createForm = () => {
  const form = document.createElement('form');
  form.classList.add('form-inline');
  const formDiv = document.createElement('div');
  formDiv.classList.add('form-group', 'mb-2');
  const label = document.createElement('label');
  const input = document.createElement('input');
  const button = document.createElement('button');

  setAttributes(label, [{ type: 'for', value: 'inputText' }, { type: 'class', value: 'sr-only' }]);
  setAttributes(input, [
    { type: 'type', value: 'text' },
    { type: 'class', value: 'form-control' },
    { type: 'id', value: 'inputText' },
    { type: 'placeholder', value: 'add feed' },
  ]);
  button.classList.add('btn', 'btn-primary', 'mb-2');
  button.setAttribute('type', 'submit');
  button.innerText = 'Submit';

  appendChildren(formDiv, [label, input]);
  appendChildren(form, [formDiv, button]);
  return form;
};

const createJumbotron = () => {
  const div = document.createElement('div');
  div.classList.add('jumbotron');
  const h1 = document.createElement('h1');
  h1.classList.add('display-4');
  h1.innerText = 'Hello World';
  const p1 = document.createElement('p');
  p1.classList.add('lead');
  p1.innerText = 'This is a simple hero unit...';
  const p2 = document.createElement('p');
  p2.innerText = 'It uses utility classes for typography...';
  const hr = document.createElement('hr');
  hr.classList.add('my-4');
  const a = document.createElement('a');
  a.classList.add('btn', 'btn-primary', 'btn-lg');
  setAttributes(a, [{ type: 'href', value: '#' }, { type: 'role', value: 'button' }]);
  a.innerText = 'Submit';

  appendChildren(div, [h1, p1, hr, p2, a]);
  return div;
};


export default () => {
  const { body } = document;
  const form = createForm();
  const jumbotron = createJumbotron();
  appendChildren(body, [form, jumbotron]);
};
