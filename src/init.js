import axios from 'axios';
import isURL from 'validator/lib/isURL';
import { find } from 'lodash';
import $ from 'jquery';
import url from 'url';
import startWatching from './watchers';

const parseRssData = (data) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(data, 'text/html');
  const channel = document.getElementsByTagName('channel')[0];
  const title = channel.querySelector('title').innerHTML;
  const description = channel.querySelector('description').innerHTML;
  const items = channel.getElementsByTagName('item');
  const itemList = Array.from(items).map((item) => {
    const itemTitle = item.querySelector('title').innerHTML;
    const itemDescription = item.querySelector('description').innerHTML;
    const link = item.querySelector('guid').innerHTML;
    return { title: itemTitle, link, description: itemDescription };
  });
  return { title, description, itemList };
};

export default () => {
  const state = {
    feedURLs: [],
    feedList: [],
    modalData: { isOpen: false, data: '' },
    errorModalData: { isOpen: false, data: '' },
    isInputValid: true,
  };

  const handleClick = ({ description }) => () => {
    state.modalData = { isOpen: true, data: description };
  };

  $('#modal').on('hide.bs.modal', () => {
    state.modalData = { isOpen: false, data: '' };
  });

  $('#errorModal').on('hide.bs.modal', () => {
    state.errorModalData = { isOpen: false, data: '' };
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const input = document.getElementById('textInput');
    const requestedUrl = input.value;
    const { feedURLs } = state;
    const includesURL = find(feedURLs, el => el === requestedUrl);
    if (!isURL(requestedUrl) || includesURL) {
      state.isInputValid = false;
      return;
    }
    state.isInputValid = true;
    input.value = '';
    const urlWithProxy = url.format({
      protocol: 'https',
      hostname: 'thingproxy.freeboard.io/fetch',
      pathname: requestedUrl,
    });
    axios.get(urlWithProxy, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    }).then(({ data }) => {
      const parsedFeedData = parseRssData(data);
      state.feedURLs = [requestedUrl, ...feedURLs];
      state.feedList = [parsedFeedData, ...state.feedList];
    }).catch((err) => {
      state.errorModalData = { isOpen: true, data: err };
    });
  };

  const [form] = document.getElementsByTagName('form');
  form.addEventListener('submit', handleSubmit);
  startWatching(state, handleClick);
};
