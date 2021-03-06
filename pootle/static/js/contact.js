'use strict';

var $ = require('jquery');

require('jquery-magnific-popup');
require('jquery-serializeObject');


var sel = {
  data: {
    target: '[data-action="contact"]',
    subjectPrefix: 'subject-prefix',
    subject: 'subject',
    body: 'body'
  },
  wrapper: '#js-contact',
  form: '#js-contact form',
  formSent: '#js-sent',
  subject: '#js-contact #id_subject',
  body: '#js-contact #id_body'
};


var contact = {

  url: null,

  init: function (options) {
    options && $.extend(this, options);

    $(document).on('click', sel.data.target, this.onClick.bind(this));
    $(document).on('submit', sel.form, this.onSubmit.bind(this));
  },

  onClick: function (e) {
    e.preventDefault();

    var contactUrl = this.url;
    if (contactUrl === null) {
      return false;
    }

    var $el = $(e.target),
        sP = $el.data(sel.data.subjectPrefix),
        subjectPrefix = sP ? ['[', sP, '] '].join('') : sP,
        subject = $el.data(sel.data.subject),
        body = $el.data(sel.data.body);

    $.magnificPopup.open({
      items: {
        src: contactUrl,
        type: 'ajax'
      },
      callbacks: {
        ajaxContentAdded: function () {
          var newSubject = [];
          subjectPrefix && newSubject.push(subjectPrefix);
          subject && newSubject.push(subject);

          newSubject.length && $(sel.subject).val(newSubject.join(''));
          body && $(sel.body).val(body);
        }
      },
      mainClass: 'popup-ajax'
    });
  },

  onSubmit: function (e) {
    e.preventDefault();

    var $form = $(sel.form),
        url = $form.attr('action'),
        data = $form.serializeObject(),
        captchaCallbacks = {
          sfn: 'PTL.contact.onSubmit',
          efn: 'PTL.contact.onError'
        };
    $.extend(data, captchaCallbacks);

    this.sendMessage(url, data);
  },

  sendMessage: function (url, data) {
    var that = this;
    $.ajax({
      url: url,
      type: 'POST',
      data: data,
      dataType: 'json',
      success: that.onSuccess.bind(that),
      error: that.onError.bind(that),
    });
  },

  onSuccess: function (xhr) {
    // Display thank you message
    $(sel.wrapper).hide();
    $(sel.formSent).show();
  },

  onError: function (xhr) {
    var errors = $.parseJSON(xhr.responseText);
    this.displayErrors(errors);
  },

  /* Displays errors returned by the contact request */
  displayErrors: function (errors) {
    $('ul.errorlist').remove();

    for (var fieldName in errors) {
      this.validationError(fieldName, errors[fieldName]);
    }
  },

  /* Injects a form validation error next to the input it failed to
   * validate */
  validationError: function (fieldName, msgs) {
    var $field = $('#id_' + fieldName),
        errorList = ['<ul class="errorlist">'];
    for (var i=0; i<msgs.length; i++) {
      errorList.push(['<li>', msgs[i], '</li>'].join(''));
    }
    errorList.push(['</ul>']);

    $field.after(errorList.join(''));
  }

};


module.exports = contact;
