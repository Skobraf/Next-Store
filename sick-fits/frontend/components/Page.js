import React from 'react';
import Header from './Header';

class Page extends React.Component {
    render() {
        return (
            <div>
                <Header />
                {this.props.children}
            </div>
        )
    }
}
export default Page;