import { watch } from 'melanke-watchjs';
import $ from 'jquery';

const startWatching = (state, handleClick) => {
  watch(state, 'isFeedLoading', () => {
    document.getElementById('submitButton').disabled = state.isFeedLoading;
  });

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
    state.feedList.forEach(({ itemList, id }) => {
      const hr = document.createElement('hr');
      let targetUl = document.getElementById(id);
      if (!targetUl) {
        targetUl = document.createElement('ul');
        targetUl.setAttribute('id', id);
      } else {
        targetUl.innerHTML = '';
      }
      targetUl.append(hr);
      const input = document.getElementById('textInput');
      input.value = '';
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
        targetUl.append(li);
      });
      jumbotron.append(targetUl);
    });
  });
};
export default startWatching;
