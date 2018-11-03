'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
const isStar = true;

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    const HANDLERS_STORAGE = {};

    return {

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @returns {Object}
         */
        on: function (event, context, handler) {
            saveHandler(event, context, handler, HANDLERS_STORAGE);

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object}
         */
        off: function (event, context) {
            removeHandler(event, context, HANDLERS_STORAGE);

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object}
         */
        emit: function (event) {
            getHandlersData(event, HANDLERS_STORAGE).forEach(data => {
                data.handler.call(data.context);
            });

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Object}
         */
        several: function (event, context, handler, times) {
            if (times <= 0) {
                return this.on(event, context, handler);
            }
            let counter = times;

            return this.on(event, context, function wrappedHandler() {
                handler.call(context);
                counter--;
                if (counter <= 0) {
                    HANDLERS_STORAGE[event].forEach((data, index, array) => {
                        if (data.handler === wrappedHandler) {
                            array.splice(index, 1);
                        }
                    });
                }
            });
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {Object}
         */
        through: function (event, context, handler, frequency) {
            if (frequency <= 0) {
                return this.on(event, context, handler);
            }
            let counter = 0;

            return this.on(event, context, function () {
                if (counter % frequency === 0) {
                    handler.call(context);
                }
                counter++;
            });
        }
    };
}

/**
 * Возвращает массив объектов с данными: context и handler
 * @param {String} event - событие
 * @param {Object} handlersStorage - хранилище обработчиков
 * @returns {Array}
 */
function getHandlersData(event, handlersStorage) {
    let eventHandlers = [];
    Object.keys(handlersStorage).filter(name => {
        return event === name || event.indexOf(name + '.') === 0;
    })
        .sort()
        .reverse() // сортировка в порядке slide.funny, slide
        .forEach(name => {
            eventHandlers = eventHandlers.concat(handlersStorage[name]);
        });

    return eventHandlers;
}

/**
 * Сохраняет обработчик
 * @param {String} event - событие
 * @param {Object} context - контекст
 * @param {Function} handler - обработчик
 * @param {Object} handlersStorage - хранилище обработчиков
 */
function saveHandler(event, context, handler, handlersStorage) {
    if (!handlersStorage.hasOwnProperty(event)) {
        handlersStorage[event] = [];
    }
    handlersStorage[event].push({
        context: context,
        handler: handler
    });
}

/**
 * Удаляет обработчики
 * @param {String} event - событие
 * @param {Object} context - контекст
 * @param {Object} handlersStorage - хранилище обработчиков
 */
function removeHandler(event, context, handlersStorage) {
    Object.keys(handlersStorage).forEach(eventName => {
        if (event !== eventName && eventName.indexOf(event + '.') !== 0) {
            return;
        }
        handlersStorage[eventName].forEach((data, index, array) => {
            if (data.context === context) {
                array.splice(index, 1);
            }
        });
    });
}

module.exports = {
    getEmitter,

    isStar
};
