import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { shallow, render, mount } from 'enzyme';

global.shallow = shallow;
global.render = render;
global.mount = mount;
global.React = React;
// Обрушим тест при любой ошибке
// console.error = message => {
//     // console.log(message)
//     // throw new Error(message);
//     return
// };

configure({ adapter: new Adapter() });
