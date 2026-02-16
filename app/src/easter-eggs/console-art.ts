/** Console ASCII art — displayed when the app loads. */

export function printConsoleArt(): void {
  // eslint-disable-next-line no-console
  console.log(
    `%c
 ██████╗██████╗ ██╗   ██╗██████╗ ████████╗ ██████╗
██╔════╝██╔══██╗╚██╗ ██╔╝██╔══██╗╚══██╔══╝██╔═══██╗
██║     ██████╔╝ ╚████╔╝ ██████╔╝   ██║   ██║   ██║
██║     ██╔══██╗  ╚██╔╝  ██╔═══╝    ██║   ██║   ██║
╚██████╗██║  ██║   ██║   ██║        ██║   ╚██████╔╝
 ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝        ╚═╝    ╚═════╝
██████╗ ██╗      ██████╗  ██████╗██╗  ██╗███████╗
██╔══██╗██║     ██╔═══██╗██╔════╝██║ ██╔╝██╔════╝
██████╔╝██║     ██║   ██║██║     █████╔╝ ███████╗
██╔══██╗██║     ██║   ██║██║     ██╔═██╗ ╚════██║
██████╔╝███████╗╚██████╔╝╚██████╗██║  ██╗███████║
╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝`,
    'color: #89b4fa; font-size: 8px; line-height: 1.1;'
  )

  // eslint-disable-next-line no-console
  console.log(
    '%c👋 Hey there, curious one! Looking for secrets?',
    'color: #f9e2af; font-size: 14px; font-weight: bold;'
  )
  // eslint-disable-next-line no-console
  console.log(
    '%c"The plans were on display in the bottom of a locked filing cabinet\n stuck in a disused lavatory with a sign on the door saying\n \'Beware of the Leopard.\'" — Douglas Adams\n\n💡 Hint: ↑↑↓↓←→←→BA',
    'color: #6c7086; font-size: 11px; font-style: italic;'
  )
}
