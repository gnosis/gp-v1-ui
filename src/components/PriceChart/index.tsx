import React, { useState, useMemo, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { createChart, CrosshairMode, IChartApi } from 'lightweight-charts'

const Wrapper = styled.div`
  width: 100%;
  height: 100%;

  > div {
    height: 100%;
    width: 100%;
  }
`

const dayData = {
  price: [
    { time: '2018-10-19', open: 54.62, high: 55.5, low: 54.52, close: 54.9 },
    { time: '2018-10-22', open: 55.08, high: 55.27, low: 54.61, close: 54.98 },
    { time: '2018-10-23', open: 56.09, high: 57.47, low: 56.09, close: 57.21 },
    { time: '2018-10-24', open: 57.0, high: 58.44, low: 56.41, close: 57.42 },
    { time: '2018-10-25', open: 57.46, high: 57.63, low: 56.17, close: 56.43 },
    { time: '2018-10-26', open: 56.26, high: 56.62, low: 55.19, close: 55.51 },
    { time: '2018-10-29', open: 55.81, high: 57.15, low: 55.72, close: 56.48 },
    { time: '2018-10-30', open: 56.92, high: 58.8, low: 56.92, close: 58.18 },
    { time: '2018-10-31', open: 58.32, high: 58.32, low: 56.76, close: 57.09 },
    { time: '2018-11-01', open: 56.98, high: 57.28, low: 55.55, close: 56.05 },
    { time: '2018-11-02', open: 56.34, high: 57.08, low: 55.92, close: 56.63 },
    { time: '2018-11-05', open: 56.51, high: 57.45, low: 56.51, close: 57.21 },
    { time: '2018-11-06', open: 57.02, high: 57.35, low: 56.65, close: 57.21 },
    { time: '2018-11-07', open: 57.55, high: 57.78, low: 57.03, close: 57.65 },
    { time: '2018-11-08', open: 57.7, high: 58.44, low: 57.66, close: 58.27 },
    { time: '2018-11-09', open: 58.32, high: 59.2, low: 57.94, close: 58.46 },
    { time: '2018-11-12', open: 58.84, high: 59.4, low: 58.54, close: 58.72 },
    { time: '2018-11-13', open: 59.09, high: 59.14, low: 58.32, close: 58.66 },
    { time: '2018-11-14', open: 59.13, high: 59.32, low: 58.41, close: 58.94 },
    { time: '2018-11-15', open: 58.85, high: 59.09, low: 58.45, close: 59.08 },
    { time: '2018-11-16', open: 59.06, high: 60.39, low: 58.91, close: 60.21 },
    { time: '2018-11-19', open: 60.25, high: 61.32, low: 60.18, close: 60.62 },
    { time: '2018-11-20', open: 61.03, high: 61.58, low: 59.17, close: 59.46 },
    { time: '2018-11-21', open: 59.26, high: 59.9, low: 58.88, close: 59.16 },
    { time: '2018-11-23', open: 58.86, high: 59.0, low: 58.29, close: 58.64 },
    { time: '2018-11-26', open: 58.64, high: 59.51, low: 58.31, close: 59.17 },
    { time: '2018-11-27', open: 59.21, high: 60.7, low: 59.18, close: 60.65 },
    { time: '2018-11-28', open: 60.7, high: 60.73, low: 59.64, close: 60.06 },
    { time: '2018-11-29', open: 59.42, high: 59.79, low: 59.26, close: 59.45 },
    { time: '2018-11-30', open: 59.57, high: 60.37, low: 59.48, close: 60.3 },
    { time: '2018-12-03', open: 59.5, high: 59.75, low: 57.69, close: 58.16 },
    { time: '2018-12-04', open: 58.1, high: 59.4, low: 57.96, close: 58.09 },
    { time: '2018-12-06', open: 58.18, high: 58.64, low: 57.16, close: 58.08 },
    { time: '2018-12-07', open: 57.91, high: 58.43, low: 57.34, close: 57.68 },
    { time: '2018-12-10', open: 57.8, high: 58.37, low: 56.87, close: 58.27 },
    { time: '2018-12-11', open: 58.77, high: 59.4, low: 58.63, close: 58.85 },
    { time: '2018-12-12', open: 57.79, high: 58.19, low: 57.23, close: 57.25 },
    { time: '2018-12-13', open: 57.0, high: 57.5, low: 56.81, close: 57.09 },
    { time: '2018-12-14', open: 56.95, high: 57.5, low: 56.75, close: 57.08 },
    { time: '2018-12-17', open: 57.06, high: 57.31, low: 55.53, close: 55.95 },
    { time: '2018-12-18', open: 55.94, high: 56.69, low: 55.31, close: 55.65 },
    { time: '2018-12-19', open: 55.72, high: 56.92, low: 55.5, close: 55.86 },
    { time: '2018-12-20', open: 55.92, high: 56.01, low: 54.26, close: 55.07 },
    { time: '2018-12-21', open: 54.84, high: 56.53, low: 54.24, close: 54.92 },
    { time: '2018-12-24', open: 54.68, high: 55.04, low: 52.94, close: 53.05 },
    { time: '2018-12-26', open: 53.23, high: 54.47, low: 52.4, close: 54.44 },
    { time: '2018-12-27', open: 54.31, high: 55.17, low: 53.35, close: 55.15 },
    { time: '2018-12-28', open: 55.37, high: 55.86, low: 54.9, close: 55.27 },
    { time: '2018-12-31', open: 55.53, high: 56.23, low: 55.07, close: 56.22 },
    { time: '2019-01-02', open: 56.16, high: 56.16, low: 55.28, close: 56.02 },
    { time: '2019-01-03', open: 56.3, high: 56.99, low: 56.06, close: 56.22 },
    { time: '2019-01-04', open: 56.49, high: 56.89, low: 55.95, close: 56.36 },
    { time: '2019-01-07', open: 56.76, high: 57.26, low: 56.55, close: 56.72 },
    { time: '2019-01-08', open: 57.27, high: 58.69, low: 57.05, close: 58.38 },
    { time: '2019-01-09', open: 57.68, high: 57.72, low: 56.85, close: 57.05 },
    { time: '2019-01-10', open: 57.29, high: 57.7, low: 56.87, close: 57.6 },
    { time: '2019-01-11', open: 57.84, high: 58.26, low: 57.42, close: 58.02 },
    { time: '2019-01-14', open: 57.83, high: 58.15, low: 57.67, close: 58.03 },
    { time: '2019-01-15', open: 57.74, high: 58.29, low: 57.58, close: 58.1 },
    { time: '2019-01-16', open: 57.93, high: 57.93, low: 57.0, close: 57.08 },
    { time: '2019-01-17', open: 57.16, high: 57.4, low: 56.21, close: 56.83 },
    { time: '2019-01-18', open: 56.92, high: 57.47, low: 56.84, close: 57.09 },
    { time: '2019-01-22', open: 57.23, high: 57.39, low: 56.4, close: 56.99 },
    { time: '2019-01-23', open: 56.98, high: 57.87, low: 56.93, close: 57.76 },
    { time: '2019-01-24', open: 57.61, high: 57.65, low: 56.5, close: 57.07 },
    { time: '2019-01-25', open: 57.18, high: 57.47, low: 56.23, close: 56.4 },
    { time: '2019-01-28', open: 56.12, high: 56.22, low: 54.8, close: 55.07 },
    { time: '2019-01-29', open: 53.62, high: 54.3, low: 52.97, close: 53.28 },
    { time: '2019-01-30', open: 53.1, high: 54.02, low: 52.28, close: 54.0 },
    { time: '2019-01-31', open: 54.05, high: 55.19, low: 53.53, close: 55.06 },
    { time: '2019-02-01', open: 55.21, high: 55.3, low: 54.47, close: 54.55 },
    { time: '2019-02-04', open: 54.6, high: 54.69, low: 53.67, close: 54.04 },
    { time: '2019-02-05', open: 54.1, high: 54.34, low: 53.61, close: 54.14 },
    { time: '2019-02-06', open: 54.11, high: 54.37, low: 53.68, close: 53.79 },
    { time: '2019-02-07', open: 53.61, high: 53.73, low: 53.02, close: 53.57 },
    { time: '2019-02-08', open: 53.36, high: 53.96, low: 53.3, close: 53.95 },
    { time: '2019-02-11', open: 54.13, high: 54.37, low: 53.86, close: 54.05 },
    { time: '2019-02-12', open: 54.45, high: 54.77, low: 54.19, close: 54.42 },
    { time: '2019-02-13', open: 54.35, high: 54.77, low: 54.28, close: 54.48 },
    { time: '2019-02-14', open: 54.38, high: 54.52, low: 53.95, close: 54.03 },
    { time: '2019-02-15', open: 54.48, high: 55.19, low: 54.32, close: 55.16 },
    { time: '2019-02-19', open: 55.06, high: 55.66, low: 54.82, close: 55.44 },
    { time: '2019-02-20', open: 55.37, high: 55.91, low: 55.24, close: 55.76 },
    { time: '2019-02-21', open: 55.55, high: 56.72, low: 55.46, close: 56.15 },
    { time: '2019-02-22', open: 56.43, high: 57.13, low: 56.4, close: 56.92 },
    { time: '2019-02-25', open: 57.0, high: 57.27, low: 56.55, close: 56.78 },
    { time: '2019-02-26', open: 56.82, high: 57.09, low: 56.46, close: 56.64 },
    { time: '2019-02-27', open: 56.55, high: 56.73, low: 56.35, close: 56.72 },
    { time: '2019-02-28', open: 56.74, high: 57.61, low: 56.72, close: 56.92 },
    { time: '2019-03-01', open: 57.02, high: 57.15, low: 56.35, close: 56.96 },
    { time: '2019-03-04', open: 57.15, high: 57.34, low: 55.66, close: 56.24 },
    { time: '2019-03-05', open: 56.09, high: 56.17, low: 55.51, close: 56.08 },
    { time: '2019-03-06', open: 56.19, high: 56.42, low: 55.45, close: 55.68 },
    { time: '2019-03-07', open: 55.76, high: 56.4, low: 55.72, close: 56.3 },
    { time: '2019-03-08', open: 56.36, high: 56.68, low: 56.0, close: 56.53 },
    { time: '2019-03-11', open: 56.76, high: 57.62, low: 56.75, close: 57.58 },
    { time: '2019-03-12', open: 57.63, high: 58.11, low: 57.36, close: 57.43 },
    { time: '2019-03-13', open: 57.37, high: 57.74, low: 57.34, close: 57.66 },
    { time: '2019-03-14', open: 57.71, high: 58.09, low: 57.51, close: 57.95 },
    { time: '2019-03-15', open: 58.04, high: 58.51, low: 57.93, close: 58.39 },
    { time: '2019-03-18', open: 58.27, high: 58.32, low: 57.56, close: 58.07 },
    { time: '2019-03-19', open: 58.1, high: 58.2, low: 57.31, close: 57.5 },
    { time: '2019-03-20', open: 57.51, high: 58.05, low: 57.11, close: 57.67 },
    { time: '2019-03-21', open: 57.58, high: 58.49, low: 57.57, close: 58.29 },
    { time: '2019-03-22', open: 58.16, high: 60.0, low: 58.13, close: 59.76 },
    { time: '2019-03-25', open: 59.63, high: 60.19, low: 59.53, close: 60.08 },
    { time: '2019-03-26', open: 60.3, high: 60.69, low: 60.17, close: 60.63 },
    { time: '2019-03-27', open: 60.56, high: 61.19, low: 60.48, close: 60.88 },
    { time: '2019-03-28', open: 60.88, high: 60.89, low: 58.44, close: 59.08 },
    { time: '2019-03-29', open: 59.2, high: 59.27, low: 58.32, close: 59.13 },
    { time: '2019-04-01', open: 59.39, high: 59.41, low: 58.79, close: 59.09 },
    { time: '2019-04-02', open: 59.22, high: 59.23, low: 58.34, close: 58.53 },
    { time: '2019-04-03', open: 58.78, high: 59.07, low: 58.41, close: 58.87 },
    { time: '2019-04-04', open: 58.84, high: 59.1, low: 58.77, close: 58.99 },
    { time: '2019-04-05', open: 59.02, high: 59.09, low: 58.82, close: 59.09 },
    { time: '2019-04-08', open: 59.02, high: 59.13, low: 58.72, close: 59.13 },
    { time: '2019-04-09', open: 58.37, high: 58.56, low: 58.04, close: 58.4 },
    { time: '2019-04-10', open: 58.4, high: 58.7, low: 58.36, close: 58.61 },
    { time: '2019-04-11', open: 58.65, high: 58.73, low: 58.2, close: 58.56 },
    { time: '2019-04-12', open: 58.75, high: 58.79, low: 58.52, close: 58.74 },
    { time: '2019-04-15', open: 58.91, high: 58.95, low: 58.59, close: 58.71 },
    { time: '2019-04-16', open: 58.79, high: 58.98, low: 58.66, close: 58.79 },
    { time: '2019-04-17', open: 58.4, high: 58.46, low: 57.64, close: 57.78 },
    { time: '2019-04-18', open: 57.51, high: 58.2, low: 57.28, close: 58.04 },
    { time: '2019-04-22', open: 58.14, high: 58.49, low: 57.89, close: 58.37 },
    { time: '2019-04-23', open: 57.62, high: 57.72, low: 56.3, close: 57.15 },
    { time: '2019-04-24', open: 57.34, high: 57.57, low: 56.73, close: 57.08 },
    { time: '2019-04-25', open: 56.82, high: 56.9, low: 55.75, close: 55.85 },
    { time: '2019-04-26', open: 56.06, high: 56.81, low: 55.83, close: 56.58 },
    { time: '2019-04-29', open: 56.75, high: 57.17, low: 56.71, close: 56.84 },
    { time: '2019-04-30', open: 56.99, high: 57.45, low: 56.76, close: 57.19 },
    { time: '2019-05-01', open: 57.23, high: 57.3, low: 56.52, close: 56.52 },
    { time: '2019-05-02', open: 56.81, high: 58.23, low: 56.68, close: 56.99 },
    { time: '2019-05-03', open: 57.15, high: 57.36, low: 56.87, close: 57.24 },
    { time: '2019-05-06', open: 56.83, high: 57.09, low: 56.74, close: 56.91 },
    { time: '2019-05-07', open: 56.69, high: 56.81, low: 56.33, close: 56.63 },
    { time: '2019-05-08', open: 56.66, high: 56.7, low: 56.25, close: 56.38 },
    { time: '2019-05-09', open: 56.12, high: 56.56, low: 55.93, close: 56.48 },
    { time: '2019-05-10', open: 56.49, high: 57.04, low: 56.26, close: 56.91 },
    { time: '2019-05-13', open: 56.72, high: 57.34, low: 56.66, close: 56.75 },
    { time: '2019-05-14', open: 56.76, high: 57.19, low: 56.5, close: 56.55 },
    { time: '2019-05-15', open: 56.51, high: 56.84, low: 56.17, close: 56.81 },
    { time: '2019-05-16', open: 57.0, high: 57.8, low: 56.82, close: 57.38 },
    { time: '2019-05-17', open: 57.06, high: 58.48, low: 57.01, close: 58.09 },
    { time: '2019-05-20', open: 59.15, high: 60.54, low: 58.0, close: 59.01 },
    { time: '2019-05-21', open: 59.1, high: 59.63, low: 58.76, close: 59.5 },
    { time: '2019-05-22', open: 59.09, high: 59.37, low: 58.96, close: 59.25 },
    { time: '2019-05-23', open: 59.07, high: 59.36, low: 58.67, close: 59.32 },
    { time: '2019-05-24', open: 59.21, high: 59.66, low: 59.02, close: 59.57 },
    { time: '2019-05-25', open: 59.0, high: 59.27, low: 58.54, close: 58.87 },
  ],
  volume: [
    { time: '2018-10-19', value: 19103293.0 },
    { time: '2018-10-22', value: 21737523.0 },
    { time: '2018-10-23', value: 29328713.0 },
    { time: '2018-10-24', value: 37435638.0 },
    { time: '2018-10-25', value: 25269995.0 },
    { time: '2018-10-26', value: 24973311.0 },
    { time: '2018-10-29', value: 22103692.0 },
    { time: '2018-10-30', value: 25231199.0 },
    { time: '2018-10-31', value: 24214427.0 },
    { time: '2018-11-01', value: 22533201.0 },
    { time: '2018-11-02', value: 14734412.0 },
    { time: '2018-11-05', value: 12733842.0 },
    { time: '2018-11-06', value: 12371207.0 },
    { time: '2018-11-07', value: 14891287.0 },
    { time: '2018-11-08', value: 12482392.0 },
    { time: '2018-11-09', value: 17365762.0 },
    { time: '2018-11-12', value: 13236769.0 },
    { time: '2018-11-13', value: 13047907.0 },
    { time: '2018-11-14', value: 18288710.0 },
    { time: '2018-11-15', value: 17147123.0 },
    { time: '2018-11-16', value: 19470986.0 },
    { time: '2018-11-19', value: 18405731.0 },
    { time: '2018-11-20', value: 22028957.0 },
    { time: '2018-11-21', value: 18482233.0 },
    { time: '2018-11-23', value: 7009050.0 },
    { time: '2018-11-26', value: 12308876.0 },
    { time: '2018-11-27', value: 14118867.0 },
    { time: '2018-11-28', value: 18662989.0 },
    { time: '2018-11-29', value: 14763658.0 },
    { time: '2018-11-30', value: 31142818.0 },
    { time: '2018-12-03', value: 27795428.0 },
    { time: '2018-12-04', value: 21727411.0 },
    { time: '2018-12-06', value: 26880429.0 },
    { time: '2018-12-07', value: 16948126.0 },
    { time: '2018-12-10', value: 16603356.0 },
    { time: '2018-12-11', value: 14991438.0 },
    { time: '2018-12-12', value: 18892182.0 },
    { time: '2018-12-13', value: 15454706.0 },
    { time: '2018-12-14', value: 13960870.0 },
    { time: '2018-12-17', value: 18902523.0 },
    { time: '2018-12-18', value: 18895777.0 },
    { time: '2018-12-19', value: 20968473.0 },
    { time: '2018-12-20', value: 26897008.0 },
    { time: '2018-12-21', value: 55413082.0 },
    { time: '2018-12-24', value: 15077207.0 },
    { time: '2018-12-26', value: 17970539.0 },
    { time: '2018-12-27', value: 17530977.0 },
    { time: '2018-12-28', value: 14771641.0 },
    { time: '2018-12-31', value: 15331758.0 },
    { time: '2019-01-02', value: 13969691.0 },
    { time: '2019-01-03', value: 19245411.0 },
    { time: '2019-01-04', value: 17035848.0 },
    { time: '2019-01-07', value: 16348982.0 },
    { time: '2019-01-08', value: 21425008.0 },
    { time: '2019-01-09', value: 18136000.0 },
    { time: '2019-01-10', value: 14259910.0 },
    { time: '2019-01-11', value: 15801548.0 },
    { time: '2019-01-14', value: 11342293.0 },
    { time: '2019-01-15', value: 10074386.0 },
    { time: '2019-01-16', value: 13411691.0 },
    { time: '2019-01-17', value: 15223854.0 },
    { time: '2019-01-18', value: 16802516.0 },
    { time: '2019-01-22', value: 18284771.0 },
    { time: '2019-01-23', value: 15109007.0 },
    { time: '2019-01-24', value: 12494109.0 },
    { time: '2019-01-25', value: 17806822.0 },
    { time: '2019-01-28', value: 25955718.0 },
    { time: '2019-01-29', value: 33789235.0 },
    { time: '2019-01-30', value: 27260036.0 },
    { time: '2019-01-31', value: 28585447.0 },
    { time: '2019-02-01', value: 13778392.0 },
    { time: '2019-02-04', value: 15818901.0 },
    { time: '2019-02-05', value: 14124794.0 },
    { time: '2019-02-06', value: 11391442.0 },
    { time: '2019-02-07', value: 12436168.0 },
    { time: '2019-02-08', value: 12011657.0 },
    { time: '2019-02-11', value: 9802798.0 },
    { time: '2019-02-12', value: 11227550.0 },
    { time: '2019-02-13', value: 11884803.0 },
    { time: '2019-02-14', value: 11190094.0 },
    { time: '2019-02-15', value: 15719416.0 },
    { time: '2019-02-19', value: 12272877.0 },
    { time: '2019-02-20', value: 11379006.0 },
    { time: '2019-02-21', value: 14680547.0 },
    { time: '2019-02-22', value: 12534431.0 },
    { time: '2019-02-25', value: 15051182.0 },
    { time: '2019-02-26', value: 12005571.0 },
    { time: '2019-02-27', value: 8962776.0 },
    { time: '2019-02-28', value: 15742971.0 },
    { time: '2019-03-01', value: 10942737.0 },
    { time: '2019-03-04', value: 13674737.0 },
    { time: '2019-03-05', value: 15749545.0 },
    { time: '2019-03-06', value: 13935530.0 },
    { time: '2019-03-07', value: 12644171.0 },
    { time: '2019-03-08', value: 10646710.0 },
    { time: '2019-03-11', value: 13627431.0 },
    { time: '2019-03-12', value: 12812980.0 },
    { time: '2019-03-13', value: 14168350.0 },
    { time: '2019-03-14', value: 12148349.0 },
    { time: '2019-03-15', value: 23715337.0 },
    { time: '2019-03-18', value: 12168133.0 },
    { time: '2019-03-19', value: 13462686.0 },
    { time: '2019-03-20', value: 11903104.0 },
    { time: '2019-03-21', value: 10920129.0 },
    { time: '2019-03-22', value: 25125385.0 },
    { time: '2019-03-25', value: 15463411.0 },
    { time: '2019-03-26', value: 12316901.0 },
    { time: '2019-03-27', value: 13290298.0 },
    { time: '2019-03-28', value: 20547060.0 },
    { time: '2019-03-29', value: 17283871.0 },
    { time: '2019-04-01', value: 16331140.0 },
    { time: '2019-04-02', value: 11408146.0 },
    { time: '2019-04-03', value: 15491724.0 },
    { time: '2019-04-04', value: 8776028.0 },
    { time: '2019-04-05', value: 11497780.0 },
    { time: '2019-04-08', value: 11680538.0 },
    { time: '2019-04-09', value: 10414416.0 },
    { time: '2019-04-10', value: 8782061.0 },
    { time: '2019-04-11', value: 9219930.0 },
    { time: '2019-04-12', value: 10847504.0 },
    { time: '2019-04-15', value: 7741472.0 },
    { time: '2019-04-16', value: 10239261.0 },
    { time: '2019-04-17', value: 15498037.0 },
    { time: '2019-04-18', value: 13189013.0 },
    { time: '2019-04-22', value: 11950365.0 },
    { time: '2019-04-23', value: 23488682.0 },
    { time: '2019-04-24', value: 13227084.0 },
    { time: '2019-04-25', value: 17425466.0 },
    { time: '2019-04-26', value: 16329727.0 },
    { time: '2019-04-29', value: 13984965.0 },
    { time: '2019-04-30', value: 15469002.0 },
    { time: '2019-05-01', value: 11627436.0 },
    { time: '2019-05-02', value: 14435436.0 },
    { time: '2019-05-03', value: 9388228.0 },
    { time: '2019-05-06', value: 10066145.0 },
    { time: '2019-05-07', value: 12963827.0 },
    { time: '2019-05-08', value: 12086743.0 },
    { time: '2019-05-09', value: 14835326.0 },
    { time: '2019-05-10', value: 10707335.0 },
    { time: '2019-05-13', value: 13759350.0 },
    { time: '2019-05-14', value: 12776175.0 },
    { time: '2019-05-15', value: 10806379.0 },
    { time: '2019-05-16', value: 11695064.0 },
    { time: '2019-05-17', value: 14436662.0 },
    { time: '2019-05-20', value: 20910590.0 },
    { time: '2019-05-21', value: 14016315.0 },
    { time: '2019-05-22', value: 11487448.0 },
    { time: '2019-05-23', value: 11707083.0 },
    { time: '2019-05-24', value: 8755506.0 },
    { time: '2019-05-28', value: 3097125.0 },
  ],
}

const weekData = {
  price: [
    { time: '2019-04-01', open: 58.91, high: 58.95, low: 58.59, close: 58.71 },
    { time: '2019-04-08', open: 58.79, high: 58.98, low: 58.66, close: 58.79 },
    { time: '2019-04-15', open: 58.4, high: 58.46, low: 57.64, close: 57.78 },
    { time: '2019-04-22', open: 57.51, high: 58.2, low: 57.28, close: 58.04 },
    { time: '2019-04-29', open: 58.14, high: 58.49, low: 57.89, close: 58.37 },
    { time: '2019-05-07', open: 57.62, high: 57.72, low: 56.3, close: 57.15 },
    { time: '2019-05-14', open: 57.34, high: 57.57, low: 56.73, close: 57.08 },
    { time: '2019-05-21', open: 56.82, high: 56.9, low: 55.75, close: 55.85 },
    { time: '2019-05-28', open: 56.06, high: 56.81, low: 55.83, close: 56.58 },
    { time: '2019-05-29', open: 56.75, high: 57.17, low: 56.71, close: 56.84 },
  ],
  volume: [
    { time: '2019-04-01', value: 58.71 },
    { time: '2019-04-08', value: 58.79 },
    { time: '2019-04-15', value: 57.78 },
    { time: '2019-04-22', value: 58.04 },
    { time: '2019-04-29', value: 58.37 },
    { time: '2019-05-07', value: 57.15 },
    { time: '2019-05-14', value: 57.08 },
    { time: '2019-05-21', value: 55.85 },
    { time: '2019-05-28', value: 56.58 },
    { time: '2019-05-29', value: 56.84 },
  ],
}

const monthData = {
  price: [
    { time: '2019-04-01', open: 58.91, high: 58.95, low: 58.59, close: 58.71 },
    { time: '2019-05-01', open: 58.79, high: 58.98, low: 58.66, close: 58.79 },
    { time: '2019-06-01', open: 58.4, high: 58.46, low: 57.64, close: 57.78 },
    { time: '2019-07-01', open: 57.51, high: 58.2, low: 57.28, close: 58.04 },
    { time: '2019-08-01', open: 66.14, high: 58.49, low: 57.89, close: 58.37 },
    { time: '2019-09-01', open: 57.62, high: 57.72, low: 56.3, close: 57.15 },
    { time: '2019-10-01', open: 57.34, high: 57.57, low: 56.73, close: 57.08 },
    { time: '2019-11-01', open: 56.82, high: 56.9, low: 55.75, close: 55.85 },
    { time: '2019-12-01', open: 56.06, high: 56.81, low: 55.83, close: 56.58 },
    { time: '2020-01-01', open: 56.75, high: 57.17, low: 56.71, close: 56.84 },
  ],
  volume: [
    { time: '2019-04-01', value: 23.71 },
    { time: '2019-05-01', value: 58.79 },
    { time: '2019-06-01', value: 99.78 },
    { time: '2019-07-01', value: 58.04 },
    { time: '2019-08-01', value: 58.37 },
    { time: '2019-09-01', value: 57.15 },
    { time: '2019-10-01', value: 57.08 },
    { time: '2019-11-01', value: 55.85 },
    { time: '2019-12-01', value: 56.58 },
    { time: '2020-01-01', value: 56.84 },
  ],
}
const yearData = {
  price: [
    { time: '2010-01-01', open: 58.91, high: 58.95, low: 58.59, close: 1.71 },
    { time: '2011-01-01', open: 58.79, high: 58.98, low: 58.66, close: 33.79 },
    { time: '2012-01-01', open: 58.4, high: 58.46, low: 57.64, close: 57.78 },
    { time: '2013-01-01', open: 57.51, high: 58.2, low: 57.28, close: 58.04 },
    { time: '2014-01-01', open: 66.14, high: 58.49, low: 57.89, close: 58.37 },
    { time: '2015-01-01', open: 57.62, high: 57.72, low: 56.3, close: 570.15 },
    { time: '2016-01-01', open: 57.34, high: 57.57, low: 56.73, close: 340.08 },
    { time: '2017-01-01', open: 56.82, high: 56.9, low: 55.75, close: 100.85 },
    { time: '2018-01-01', open: 56.06, high: 56.81, low: 55.83, close: 1000.58 },
    { time: '2019-01-01', open: 56.75, high: 57.17, low: 56.71, close: 2000.84 },
  ],
  volume: [
    { time: '2010-01-01', value: 23.71 },
    { time: '2011-01-01', value: 58.79 },
    { time: '2012-01-01', value: 990.78 },
    { time: '2013-01-01', value: 58.04 },
    { time: '2014-01-01', value: 580.37 },
    { time: '2015-01-01', value: 57.15 },
    { time: '2016-01-01', value: 570.08 },
    { time: '2017-01-01', value: 550.85 },
    { time: '2018-01-01', value: 56.58 },
    { time: '2019-01-01', value: 56.84 },
  ],
}

const seriesData = {
  '1D': dayData,
  '1W': weekData,
  '1M': monthData,
  '1Y': yearData,
}

const PriceChart: React.FC = () => {
  const myRef = useRef<HTMLDivElement>(null)
  const [interval, setInterval] = useState('1D')
  const [chartDimensions, setChartDimensions] = useState({})

  // Handler to call on window resize
  function handleResize(width: number, height: number): void {
    // just to force a redraw of the chart on resize of the viewport
    setChartDimensions({
      w: width,
      h: height,
    })

    // chart.resize(width, height)

    console.log('Chartdimensions ====> ', chartDimensions)
    console.log('handleResize called !!!!!')
    console.log('new updated chartDimensions ==== ', chartDimensions)
  }

  useMemo(() => {
    // resize observer (native JS)
    const ro: ResizeObserver = new ResizeObserver((entries) => {
      console.log(entries)
      const cr = entries[0].contentRect
      handleResize(cr.width, cr.height)
    })

    // if (myRef.current) {
    //   ro.observe(myRef.current)
    //   console.log('observer = mounted ------------------')
    // }
    console.log('ResizeObserver ====>>>>> ', ro)
  }, [])

  function createNewChart(mount: HTMLDivElement | string): IChartApi {
    return createChart(mount, {
      crosshair: {
        horzLine: {
          color: '#758696',
          labelBackgroundColor: '#2C2D3F',
          labelVisible: true,
          style: 2,
          visible: true,
          width: 1,
        },
        vertLine: {
          color: '#758696',
          labelBackgroundColor: '#2C2D3F',
          labelVisible: true,
          style: 2,
          visible: true,
          width: 1,
        },
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
        borderVisible: true,
      },
      layout: {
        backgroundColor: 'transparent',
        textColor: 'white',
      },
      grid: {
        vertLines: {
          color: 'rgba(42, 46, 57, 0.6)',
        },
        horzLines: {
          color: 'rgba(42, 46, 57, 0.6)',
        },
      },
    })
  }

  useEffect(() => {
    const chartMount = myRef.current

    const chart = createNewChart(chartMount || 'empty')

    chart.applyOptions({
      localization: {
        dateFormat: "dd MMM 'yy",
        locale: 'en-US',
      },
      layout: {
        backgroundColor: 'transparent',
        textColor: 'white',
        fontSize: 11,
        fontFamily: '"Inter","Helvetica Neue",Helvetica,sans-serif',
      },
      timeScale: {
        barSpacing: 10,
        borderColor: '#2C2D3F',
        borderVisible: true,
        fixLeftEdge: false,
        lockVisibleTimeRangeOnResize: true,
        rightBarStaysOnScroll: true,
        rightOffset: 1,
        secondsVisible: true,
        timeVisible: false,
        visible: true,
      },
      overlayPriceScales: {
        alignLabels: true,
        borderColor: '#2B2B43',
        borderVisible: true,
        drawTicks: true,
        entireTextOnly: false,
        invertScale: false,
        mode: 0,
      },
    })

    const areaSeries = chart.addCandlestickSeries({
      upColor: '#181923',
      downColor: '#FF305B',
      borderVisible: true,
      wickVisible: true,
      // borderColor: '#FF305B',
      // wickColor: '#040405',
      borderUpColor: '#00C46E',
      borderDownColor: '#FF305B',
      wickUpColor: '#00C46E',
      wickDownColor: '#FF305B',
    })

    const volumeSeries = chart.addHistogramSeries({
      color: '#2C2D3F',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    })

    areaSeries.setData(seriesData[interval].price)
    volumeSeries.setData(seriesData[interval].volume)

    return (): void => {
      // if (chartMount) {
      //   ro.unobserve(chartMount)
      //   console.log('unobserving ------ chartMount')
      // }
      chart.remove()
    }
  }, [interval])

  return (
    <Wrapper>
      <span>
        {/* {Object.entries(seriesData).forEach(([key, value]) => (
          <button onClick={(): void => setInterval(value)}>{key}</button>
        ))} */}
        <button onClick={(): void => setInterval('1D')}>1D</button>
        <button onClick={(): void => setInterval('1W')}>1W</button>
        <button onClick={(): void => setInterval('1M')}>1M</button>
        <button onClick={(): void => setInterval('1Y')}>1Y</button>
      </span>
      <div ref={myRef} id="chart" />
    </Wrapper>
  )
}

export default PriceChart
