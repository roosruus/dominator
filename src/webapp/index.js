import React, {Component} from 'react';
import ReactDOM from 'react-dom';

ReactDOM.render(
  <Root/>,
  document.getElementById('root')
);


class Root extends Component {
  render() {
    return <h1>Hello World!</h1>;
  }
}
