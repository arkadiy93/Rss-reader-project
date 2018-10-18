import axios from 'axios';
import isURL from 'validator/lib/isURL';
import { find, uniqueId } from 'lodash';
import $ from 'jquery';
import urljoin from 'url-join';
import startWatching from './watchers';


const parseRssData = (data, feedURL) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(data, 'text/html');
  const [channel] = document.getElementsByTagName('channel');
  const lastUpdate = channel.querySelector('pubdate').innerHTML;
  const id = uniqueId();
  const title = channel.querySelector('title').innerHTML;
  const description = channel.querySelector('description').innerHTML;
  const items = channel.getElementsByTagName('item');
  const itemList = Array.from(items).map((item) => {
    const itemTitle = item.querySelector('title').innerHTML;
    const itemDescription = item.querySelector('description').innerHTML;
    const link = item.querySelector('guid').innerHTML;
    return {
      title: itemTitle, link, description: itemDescription, id,
    };
  });
  return {
    urlData: { id, feedURL, lastUpdate },
    listFeedData: {
      title, description, itemList, id,
    },
  };
};

export default () => {
  const state = {
    feedURLsData: [],
    feedList: [],
    modalData: { isOpen: false, data: '' },
    errorModalData: { isOpen: false, data: '' },
    isInputValid: true,
    isReloading: false,
    isFeedLoading: false,
  };

  const handleClick = ({ description }) => () => {
    state.modalData = { isOpen: true, data: description };
  };

  $('#modal').on('hide.bs.modal', () => {
    state.modalData = { isOpen: false, data: '' };
    state.errorModalData = { isOpen: false, data: '' };
  });

  const startReloading = () => {
    const parser = new DOMParser();
    setInterval(() => {
      state.feedURLsData.forEach((el) => {
        axios.get(el.feedURL, {
          headers: { 'Access-Control-Allow-Origin': '*' },
        }).then(({ data }) => {
          const { itemList } = find(state.feedList, ({ id }) => id === el.id);
          const index = state.feedList.findIndex(({ id }) => id === el.id);
          const document = parser.parseFromString(data, 'text/html');
          const [channel] = document.getElementsByTagName('channel');
          const lastUpdate = channel.querySelector('pubdate').innerHTML;
          if (lastUpdate !== el.lastUpdate) {
            const items = channel.getElementsByTagName('item');
            const newFeedItems = Array.from(items).filter((item) => {
              const itemTitle = item.querySelector('title').innerHTML;
              return !find(itemList, ({ title }) => itemTitle === title);
            }).map((item) => {
              const itemTitle = item.querySelector('title').innerHTML;
              const itemDescription = item.querySelector('description').innerHTML;
              const link = item.querySelector('guid').innerHTML;
              return {
                title: itemTitle, link, description: itemDescription, id: el.id,
              };
            });
            state.feedList[index].itemList = [...newFeedItems, ...itemList];
          }
        });
      });
    }, 5000);
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    const input = document.getElementById('textInput');
    const requestedUrl = input.value;
    const { feedURLsData } = state;
    const urlWithProxy = urljoin('https://thingproxy.freeboard.io/fetch', requestedUrl);
    const includesURL = find(feedURLsData, ({ feedURL }) => feedURL === urlWithProxy);
    if (!isURL(requestedUrl) || includesURL) {
      state.isInputValid = false;
      return;
    }
    state.isFeedLoading = true;
    state.isInputValid = true;
    axios.get(urlWithProxy, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    }).then(({ data }) => {
      state.isFeedLoading = false;
      const { urlData, listFeedData } = parseRssData(data, urlWithProxy);
      if (!state.isReloading) {
        state.isReloading = true;
        startReloading();
      }
      state.feedURLsData = [urlData, ...feedURLsData];
      state.feedList = [listFeedData, ...state.feedList];
    }).catch((err) => {
      state.isFeedLoading = false;
      state.errorModalData = { isOpen: true, data: err };
    });
  };

  const [form] = document.getElementsByTagName('form');
  form.addEventListener('submit', handleSubmit);
  startWatching(state, handleClick);
};
