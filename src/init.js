import '@babel/polyfill';
import axios from 'axios';
import isURL from 'validator/lib/isURL';
import { find, uniqueId } from 'lodash';
import $ from 'jquery';
import urljoin from 'url-join';
import startWatching from './watchers';


const parseRssData = (data, feedURL, id = uniqueId()) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(data, 'text/html');
  const [channel] = document.getElementsByTagName('channel');
  const lastUpdate = channel.querySelector('pubdate').innerHTML;
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
    parsedFeedData: {
      id, feedURL, lastUpdate, title, description,
    },
    feedList: { itemList, id },
  };
};

const handleReloadData = (el, data, state) => {
  const listIndex = state.feedList.findIndex(({ id }) => id === el.id);
  const dataIndex = state.feedData.findIndex(({ id }) => id === el.id);
  const { itemList } = state.feedList[listIndex];
  const { parsedFeedData, feedList } = parseRssData(data, el.feedURL, el.id);
  const newUpdateTime = parsedFeedData.lastUpdate;
  const newList = feedList.itemList;
  if (newUpdateTime !== el.lastUpdate) {
    const newItems = newList
      .filter(item => !find(itemList, ({ title }) => item.title === title));
    const updatedFeedData = { ...el, lastUpdate: newUpdateTime };
    const updatedList = [...newItems, ...itemList];
    return {
      listIndex, updatedFeedData, updatedList, dataIndex,
    };
  }
  return null;
};

export default () => {
  const state = {
    feedData: [],
    feedList: [],
    modalData: { isOpen: false, data: '', title: '' },
    errorModalData: { isOpen: false, data: '' },
    isInputValid: true,
    isReloading: false,
    isFeedLoading: false,
  };

  const handleClick = ({ description }) => () => {
    state.modalData = { isOpen: true, data: description, title: 'Feed information' };
  };

  $('#modal').on('hide.bs.modal', () => {
    state.modalData = { isOpen: false, data: '' };
  });

  const startReloading = async () => {
    const getNewFeeds = state.feedData.map(async (el) => {
      const { data } = await axios.get(el.feedURL, { headers: { 'Access-Control-Allow-Origin': '*' } });
      return handleReloadData(el, data, state);
    });

    try {
      const response = await Promise.all(getNewFeeds);
      response.filter(el => el).forEach((el) => {
        state.feedData[el.dataIndex] = el.updatedFeedData;
        state.feedList[el.listIndex].itemList = el.updatedList;
      });
    } catch (e) {
      console.log('an error happened');
    }
    setTimeout(startReloading, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const input = document.getElementById('textInput');
    const requestedUrl = input.value;
    const { feedData } = state;
    const urlWithProxy = urljoin('https://cors-anywhere.herokuapp.com/', requestedUrl);
    const includesURL = find(feedData, ({ feedURL }) => feedURL === urlWithProxy);
    if (!isURL(requestedUrl) || includesURL) {
      state.isInputValid = false;
      return;
    }
    state.isFeedLoading = true;
    state.isInputValid = true;
    try {
      const { data } = await axios.get(urlWithProxy, { headers: { 'Access-Control-Allow-Origin': '*' } });
      state.isFeedLoading = false;
      const { parsedFeedData, feedList } = parseRssData(data, urlWithProxy);
      state.feedData = [parsedFeedData, ...feedData];
      state.feedList = [feedList, ...state.feedList];
      if (!state.isReloading) {
        state.isReloading = true;
        startReloading();
      }
    } catch (err) {
      state.isFeedLoading = false;
      state.modalData = { isOpen: true, data: err, title: 'Error message' };
    }
  };

  const [form] = document.getElementsByTagName('form');
  form.addEventListener('submit', handleSubmit);
  startWatching(state, handleClick);
};
