import React, { Component } from 'react';
import { Alert } from 'antd';

export default class AlertMsg extends Component {
    state = {
        error: undefined,
    };

    async componentDidUpdate(prevProps) {
        if (prevProps.error !== this.props.error) {
            this.setState({
                error: this.props.error,
            });
        }
    }

    render() {
        const { error } = this.props;
        if (!error) return null;
        return <Alert message="Error" description={error} type="error" showIcon />
    }
}
