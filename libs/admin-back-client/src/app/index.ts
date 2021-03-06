import * as axios from 'axios'
import * as socket from "socket.io-client";
import * as domain from 'libs/domain-model'
import * as users from './users'
import * as info from './info'
import * as groups from './groups'
import * as teachers from './teachers'
import * as feedbacks from './feedbacks'
import * as systemSettings from './system-settings'
import * as farmLessons from './farm-lessons'
import * as files from './files'
import { ManyOutput } from './shared'

export type BaseOptions = {
  baseURL: string
  apiPath: string,
}

export type Result<R> = {
  isSuccess: boolean
  isHandled?: boolean
  error?: axios.AxiosError
  result?: R,
}

export type ErrorHandler = {
  (error: axios.AxiosError): Promise<boolean>,
}

const createExecRequest = (baseOptions: BaseOptions, errorHandler: ErrorHandler) => <I, R>(
  specificFunc: (input: I) => axios.AxiosRequestConfig,
) =>
  async (specificFuncOptions: I): Promise<Result<R>> => {
    return await axios.default({
      withCredentials: true,
      baseURL: baseOptions.baseURL + baseOptions.apiPath,
      ...specificFunc(specificFuncOptions),
    }).then((axiosResult) => {
      return { isSuccess: true, result: axiosResult.data }
    }).catch(async (error) => {
      const isHandled = await errorHandler(error)
      return { error, isHandled, isSuccess: false }
    })
  }

const createSocketConnection = (url: string): (event: string, listener: Function) => void => {
  const connection = socket(url)

  return (event, listener) => {
    connection.on(event, listener)
  }
}

export const initClient = (baseOptions: BaseOptions, errorHandler: ErrorHandler) => {
  const execRequest = createExecRequest(baseOptions, errorHandler)
  const socketConnection = createSocketConnection(baseOptions.baseURL)

  return {
    login: execRequest<users.LoginInput, null>(users.login),
    logout: execRequest<{}, null>(users.logout),
    updateMe: execRequest<users.UpdateUserInput, null>(users.updateCurrentUser),
    getMe: execRequest<null, domain.UserAttributes>(users.getCurrentUser),
    getUser: execRequest<users.GetUserInput, domain.UserAttributes>(users.getUser),
    getUsers: execRequest<users.GetUsersInput, ManyOutput<domain.UserAttributes>>(users.getUsers),
    createUser: execRequest<users.CreateUserInput, null>(users.createUser),
    deleteUser: execRequest<users.DeleteUserInput, null>(users.deleteUser),

    getGroup: execRequest<groups.GetGroupInput, domain.StudentsGroupAttributes>(groups.getGroup),
    getGroups: execRequest<groups.GetGroupsInput, ManyOutput<domain.StudentsGroupAttributes>>(groups.getGroups),

    getTeacher: execRequest<teachers.GetTeacherInput, domain.TeacherAttributes>(teachers.getTeacher),
    getTeachers: execRequest<teachers.GetTeachersInput, ManyOutput<domain.TeacherAttributes>>(teachers.getTeachers),

    getFeedback: execRequest<feedbacks.GetFeedbackInput, any>(feedbacks.getFeedback),
    getFeedbacks: execRequest<feedbacks.GetFeedbacksInput, ManyOutput<any>>(feedbacks.getFeedbacks),

    createInfo: execRequest<info.CreateInfoInput, null>(info.createInfo),
    updateInfo: execRequest<info.UpdateInfoInput, null>(info.updateInfo),
    getInfo: execRequest<info.GetInfoInput, domain.InfoAttributes>(info.getInfo),
    getManyInfo: execRequest<info.GetManyInfoInput, ManyOutput<domain.InfoAttributes>>(info.getManyInfo),
    deleteInfo: execRequest<info.DeleteInfoInput, null>(info.deleteInfo),
    getInfoCategories: execRequest<null, domain.InfoCategoryAttributes>(info.getInfoCategories),

    getSystemSettings: execRequest<null, domain.SystemSettingsAttributes>(systemSettings.getSystemSettings),
    updateSystemSettings: execRequest<systemSettings.UpdateSystemSettingsInput, null>(systemSettings.updateSystemSettings),

    farmLessons: execRequest<farmLessons.FarmLessonsInput, null>(farmLessons.farmLessons),

    uploadEducationProcessSchedule: execRequest<files.EducationProcessScheduleInput, null>(files.uploadEducationProcessSchedule),
    compileImages: execRequest<null, null>(files.compileImages),
    onImagesCompiling: (listener: Function) => socketConnection('image_compiling', listener)
  }
}
