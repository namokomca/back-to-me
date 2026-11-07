import assert from 'node:assert/strict';
import {suggestDivision,lifeSummary} from './src/life.js';
const tasks=[{title:'고정',minutes:25,owner:'나',done:false},{title:'유지',minutes:5,owner:'함께',done:false},{title:'미정',minutes:15,owner:'미정',done:false},{title:'초과',minutes:40,owner:'미정',done:false},{title:'완료',minutes:20,owner:'나',done:true}];
const result=suggestDivision(tasks,30,20);
assert.equal(result[0].owner,'나');assert.equal(result[1].owner,'함께');assert.equal(result[2].owner,'배우자');assert.equal(result[3].owner,'미정');assert.equal(result[4].done,true);assert.equal(tasks[2].owner,'미정');assert.deepEqual(lifeSummary(result),{open:4,unassigned:1,mine:25,partner:15});
assert.equal(suggestDivision([{title:'부족',minutes:10,owner:'미정',done:false}],0,0)[0].owner,'미정');
console.log('PASS fixed owners, completed tasks, available time, insufficient time, input immutability');

