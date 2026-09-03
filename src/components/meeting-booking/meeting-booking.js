import './meeting-booking.css'
import meetingBookingTemplate from './meeting-booking.html?raw'


export function initMeetingBooking() {
  const container = document.querySelector('[data-meeting-booking]')


  if (!container) return


  // Insertamos el HTML del componente
  container.innerHTML = meetingBookingTemplate


  const form = container.querySelector('[data-meeting-form]')
  const dateInput = container.querySelector('[data-meeting-date]')
  const timeSelect = container.querySelector('[data-meeting-time]')
  const message = container.querySelector('[data-meeting-message]')


  // Horarios temporales.
  // Luego vendrán desde Google Calendar.
  const availableTimes = [
    '09:00',
    '10:00',
    '11:00',
    '14:00',
    '15:00',
    '16:00',
  ]


  function formatTime(time) {
    const [hours, minutes] = time.split(':')


    const date = new Date()


    date.setHours(Number(hours))
    date.setMinutes(Number(minutes))


    return new Intl.DateTimeFormat('es-PE', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  }


  function showAvailableTimes(
  availableTimes,
) {
  timeSelect.innerHTML = ''


  if (!availableTimes.length) {
    timeSelect.innerHTML = `
      <option value="">
        No hay horarios disponibles
      </option>
    `


    timeSelect.disabled = true


    return
  }


  const defaultOption =
    document.createElement('option')


  defaultOption.value = ''


  defaultOption.textContent =
    'Selecciona un horario'


  timeSelect.appendChild(
    defaultOption,
  )


  availableTimes.forEach((time) => {
    const option =
      document.createElement('option')


    option.value = time


    option.textContent =
      formatTime(time)


    timeSelect.appendChild(
      option,
    )
  })


  timeSelect.disabled = false
}







  function configureMinimumDate() {
    const tomorrow = new Date()


    tomorrow.setDate(tomorrow.getDate() + 1)


    const year = tomorrow.getFullYear()
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const day = String(tomorrow.getDate()).padStart(2, '0')


    dateInput.min = `${year}-${month}-${day}`
  }


dateInput.addEventListener(
  'change',
  async () => {
    if (!dateInput.value) return


    // Comprobar si es sábado o domingo
    const selectedDate = new Date(
      `${dateInput.value}T12:00:00`,
    )


    const day = selectedDate.getDay()


    // 0 = domingo
    // 6 = sábado
    if (day === 0 || day === 6) {
      dateInput.value = ''


      timeSelect.disabled = true


      timeSelect.innerHTML = `
        <option value="">
          No atendemos sábados ni domingos
        </option>
      `


      message.textContent =
        'Las reuniones están disponibles únicamente de lunes a viernes.'


      message.hidden = false


      return
    }


    message.hidden = true


    timeSelect.disabled = true


    timeSelect.innerHTML = `
      <option value="">
        Consultando disponibilidad...
      </option>
    `


    try {
      const response = await fetch(
        `https://hub-meetings-api.pruebaform837.workers.dev/api/meetings/availability?date=${dateInput.value}`,
      )


      const data = await response.json()


      if (!response.ok) {
        throw new Error(
          data.message ||
            'No se pudo consultar disponibilidad.',
        )
      }


      showAvailableTimes(
        data.availableTimes,
      )
    } catch (error) {
      console.error(error)


      timeSelect.innerHTML = `
        <option value="">
          Error consultando horarios
        </option>
      `
    }
  },
)





form.addEventListener(
  'submit',
  async (event) => {
    event.preventDefault()


    const formData = new FormData(form)


    const meetingData = {
      name: formData.get('name'),
      company: formData.get('company'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      reason: formData.get('reason'),
      date: formData.get('date'),
      time: formData.get('time'),
    }


    const button = form.querySelector(
      '.meeting-booking__button',
    )


    try {
      // Evitamos que el usuario haga doble clic
      button.disabled = true
      button.textContent = 'Agendando...'


      message.hidden = true


      const response = await fetch(
        'https://hub-meetings-api.pruebaform837.workers.dev/api/meetings',
        {
          method: 'POST',


          headers: {
            'Content-Type': 'application/json',
          },


          body: JSON.stringify(meetingData),
        },
      )


      const data = await response.json()


      if (!response.ok) {
        throw new Error(
          data.message ||
            'No se pudo agendar la reunión.',
        )
      }


      message.textContent =
        'Reunión agendada correctamente. Revisa tu correo para ver la invitación de Google Calendar.'


      message.hidden = false


      // Limpiamos el formulario
      form.reset()


      // Volvemos a bloquear el selector de hora
      timeSelect.disabled = true


      timeSelect.innerHTML = `
        <option value="">
          Primero selecciona una fecha
        </option>
      `
    } catch (error) {
      console.error(
        'Error agendando reunión:',
        error,
      )


      message.textContent =
        error.message ||
        'Ocurrió un error al agendar la reunión.'


      message.hidden = false
    } finally {
      button.disabled = false
      button.textContent =
        'Agendar reunión'
    }
  },
)









}




