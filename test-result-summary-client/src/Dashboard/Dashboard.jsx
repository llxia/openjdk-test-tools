import React, { Component } from 'react';
import { Tabs } from 'antd';
import TabInfo from "./TabInfo";
const TabPane = Tabs.TabPane;

export default class Dashboard extends Component {

    render() {
        return <Tabs type="card">
            <TabPane tab="Test" key="1"><TabInfo tab="Test" /></TabPane>
            <TabPane tab="Perf" key="2"><TabInfo tab="Perf" /></TabPane>
        </Tabs>
    }
}