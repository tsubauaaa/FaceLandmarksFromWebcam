import React from "react";
import { Switch } from '@material-ui/core';

type AnalyzeSwitchProps = {
    isOn: boolean;
    handleChange: any;
}

export const AnalyzeSwitch: React.FC<AnalyzeSwitchProps> = ({isOn, handleChange}) =>  {
 return (
     <div>
         <Switch checked={isOn} onChange={handleChange} />
    </div>
    );
 };