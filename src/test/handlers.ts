import { http, HttpResponse } from 'msw/http'

import { CNB_DAILY_RATES_PATH } from '../api/cnb/constants'
import dailyTxt from './fixtures/daily.txt?raw'

export const handlers = [http.get(`*${CNB_DAILY_RATES_PATH}`, () => HttpResponse.text(dailyTxt))]
