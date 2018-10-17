import axios from 'axios';
import isURL from 'validator/lib/isURL';
import { find } from 'lodash';
import { watch } from 'melanke-watchjs';

const state = {
  feedURLs: [],
  feedList: [],
};

watch(state, 'feedList', () => {
  const jumbotron = document.querySelector('.jumbotron');
  const { itemList } = state.feedList[0];
  const ul = document.createElement('ul');
  itemList.forEach((item) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.setAttribute('href', item.link);
    a.innerHTML = item.title;
    li.append(a);
    ul.append(li);
  });
  jumbotron.append(ul);
});

const handleSubmit = (e) => {
  e.preventDefault();
  const input = document.getElementById('textInput');
  const requestedUrl = input.value;
  const { feedURLs } = state;
  const includesURL = find(feedURLs, el => el === requestedUrl);
  if (!isURL(requestedUrl) || includesURL) {
    input.classList.add('is-invalid');
    return;
  }
  input.classList.remove('is-invalid');
  input.value = '';
  const parser = new DOMParser();

  axios.get(`https://cors-anywhere.herokuapp.com/${requestedUrl}`, { // https://crossorigin.me/ didnt work;
    headers: { 'Access-Control-Allow-Origin': '*' },
  }).then(({ data }) => {
    state.feedURLs = [requestedUrl, ...feedURLs];
    const document = parser.parseFromString(data, 'text/html');
    const channel = document.getElementsByTagName('channel')[0];
    const title = channel.querySelector('title').innerHTML;
    const description = channel.querySelector('description').innerHTML;
    const items = channel.getElementsByTagName('item');
    const itemList = Array.from(items).map((item) => {
      const itemTitle = item.querySelector('title').innerHTML;
      const link = item.querySelector('guid').innerHTML;
      return { title: itemTitle, link };
    });
    state.feedList = [{ title, description, itemList }, ...state.feedList];
  }).catch((err) => {
    throw new Error(err);
  });
};

export default () => {
  const [form] = document.getElementsByTagName('form');
  form.addEventListener('submit', handleSubmit);
};
