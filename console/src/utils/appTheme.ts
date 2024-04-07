const themeConfig = {
  token: {
    colorBorder: 'rgba(255, 255, 255, 0.24)',
    colorBgContainer: '#252347'
  },
  components: {
    Menu: {
      darkItemBg: '#14112c',
    },
    Button: {
      colorPrimary: 'linear-gradient(to bottom, rgba(49, 172, 250, 1), rgba(7, 50, 204, 1))',
      defaultBg: 'rgba(21, 51, 201, 1)',
      defaultBorderColor: '',
    },
    Card: {
      headerBg: '#14112c',
      colorTextHeading: '#fff',
      colorBgContainer: '#14112c'
    },
    Input: {
      colorBgContainer: '#252347'
    },
    Table: {
      headerColor: 'rgba(225, 44, 255, 1)',
      headerBg: 'rgba(33, 29, 71, 1)',
    },
    Radio: {
      wrapperMarginInlineEnd: '40px'
    }
  }
}

export default themeConfig