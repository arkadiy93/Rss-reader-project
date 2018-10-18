import { watch } from 'melanke-watchjs';
import $ from 'jquery';

const startWatching = (state, handleClick) => {
  watch(state, 'isInputValid', () => {
    const input = document.getElementById('textInput');
    if (!state.isInputValid) {
      input.classList.add('is-invalid');
    } else {
      input.classList.remove('is-invalid');
    }
  });

  watch(state, 'modalData', () => {
    const modalBody = document.querySelector('.modal-body');
    const ModalTitle = document.querySelector('.modal-title');
    if (state.modalData.isOpen) {
      const p = document.createElement('p');
      ModalTitle.innerHTML = 'Feed information';
      p.innerText = state.modalData.data;
      modalBody.append(p);
      $('#modal').modal('show');
    } else {
      modalBody.innerHTML = '';
      ModalTitle.innerHTML = '';
    }
  });

  watch(state, 'errorModalData', () => {
    const modalBody = document.querySelector('.modal-body');
    const ModalTitle = document.querySelector('.modal-title');
    if (state.errorModalData.isOpen) {
      const p = document.createElement('p');
      ModalTitle.innerHTML = 'Error message';
      p.innerText = state.errorModalData.data;
      modalBody.append(p);
      $('#modal').modal('show');
    } else {
      modalBody.innerHTML = '';
      ModalTitle.innerHTML = '';
    }
  });

  watch(state, 'feedList', () => {
    const jumbotron = document.querySelector('.jumbotron');
    const { itemList } = state.feedList[0];
    const ul = document.createElement('ul');
    const hr = document.createElement('hr');
    itemList.forEach((item) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      const button = document.createElement('button');
      button.classList.add('btn', 'btn-primary');
      button.setAttribute('type', 'button');
      button.setAttribute('data-whatever', 'lol');
      button.innerHTML = 'Open';
      button.addEventListener('click', handleClick(item));
      a.setAttribute('href', item.link);
      a.innerHTML = item.title;
      li.append(a);
      li.append(button);
      ul.append(li);
    });
    jumbotron.append(hr);
    jumbotron.append(ul);
  });
};

export default startWatching;
