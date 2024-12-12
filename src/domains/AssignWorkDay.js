import { HOLIDAY, LAST_DAY, DAYWEEK, WEEKDAY, WEEKEND } from '../constants/constants.js';

class AssignWorkDay {
  /** @type {Array<{ month: number, day: number, dayWeek: string, name: string }>} */ #schedule = [];
  /** @type {Array<string>} 평일 순번 배열 */ #weekDayEmployeesArray;
  /** @type {Array<string>} 휴일 순번 배열 */ #weekEndEmployeesArray;

  /** @type {Array<string>} 평일 순번 배열 (불변) */ #immutableWeekDayEmployeesArray;
  /** @type {Array<string>} 휴일 순번 배열 (불변) */ #immutableWeekEndEmployeesArray;

  constructor(weekDayEmployees, weekEndEmployees) {
    this.#weekDayEmployeesArray = [...weekDayEmployees]; // 평일 순번 새 배열 생성
    this.#weekEndEmployeesArray = [...weekEndEmployees]; // 휴일 순번 새 배열 생성

    this.#immutableWeekDayEmployeesArray = [...weekDayEmployees]; // 평일 순번 새 배열 생성 (불변)
    this.#immutableWeekEndEmployeesArray = [...weekEndEmployees]; // 휴일 순번 새 배열 생성 (불변)
  }

  getSchedule() {
    return this.#schedule;
  }

  /**
   * 입력한 순번대로 비상 근무일을 배정한다.
   * @param {number} month 1 ~ 12
   * @param {string} startDay 월 ~ 일 
   */
  assign(month, startDay) {
    let curDayWeekIdx = DAYWEEK.indexOf(startDay); // 현재 요일 인덱스
    let weekDayIdx = 0; // 평일 배열 인덱스
    let weekEndIdx = 0; // 주말/공휴일 배열 인덱스
    for (let curDay = 1; curDay <= LAST_DAY[month]; curDay++) {
      let name = '';
      if (curDay === 41) console.log(weekEndIdx);
      if (this.#checkHoliday(curDayWeekIdx, month, curDay)) {
        const { name: updateName, weekIdx } = this.#updateArrayAndSetName(name, weekEndIdx, 'holiday');
        name = updateName;
        weekEndIdx = weekIdx;
        if (weekEndIdx === 0) this.#weekEndEmployeesArray = [...this.#immutableWeekEndEmployeesArray];
      } else if (this.#checkWeekday(curDayWeekIdx)) {
        const { name: updateName, weekIdx } = this.#updateArrayAndSetName(name, weekDayIdx, 'weekday');
        name = updateName;
        weekDayIdx = weekIdx;
        if (weekDayIdx === 0) this.#weekDayEmployeesArray = [...this.#immutableWeekDayEmployeesArray];
      }
      this.#schedule.push({ month, day: curDay, dayWeek: DAYWEEK[curDayWeekIdx], name }); // 근무 일정 추가
      curDayWeekIdx = (curDayWeekIdx + 1) % DAYWEEK.length; // 다음 요일로 업데이트
    }
  }

  #updateArrayAndSetName(name, weekIdx, day) {
    const whenIsDay = { 'holiday': this.#weekEndEmployeesArray, 'weekday': this.#weekDayEmployeesArray };

    name = whenIsDay[day].shift();
    if (this.#checkLastName(name)) {
      let nextEmployeeName = whenIsDay[day].shift();
      whenIsDay[day].unshift(name);
      name = nextEmployeeName;
    }
    whenIsDay[day].push(name);

    weekIdx = (weekIdx + 1) % whenIsDay[day].length;

    return { name, weekIdx };
  }

  /**
   * 주말 또는 공휴일인지 확인
   * @param {number} curDayWeekIdx
   * @param {number} month 
   * @param {string} curDay 
   * @returns {boolean}
   */
  #checkHoliday(curDayWeekIdx, month, curDay) {
    return WEEKEND.includes(DAYWEEK[curDayWeekIdx]) || (HOLIDAY[month] && HOLIDAY[month].includes(curDay));
  }

  /**
   * 평일인지 확인
   * @param {number} curDayWeekIdx
   * @returns {boolean}
   */
  #checkWeekday(curDayWeekIdx) {
    return WEEKDAY.includes(DAYWEEK[curDayWeekIdx]);
  }

  /**
   * 최근에 배정된 근무자 이름과 동일한지 확인
   * @param {string} name 
   * @returns {boolean}
   */
  #checkLastName(name) {
    return this.#schedule.length > 0 && this.#schedule[this.#schedule.length - 1].name === name;
  }
}

export default AssignWorkDay;
