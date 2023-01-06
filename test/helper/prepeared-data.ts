export const superUser = {
  valid: {
    login: 'admin',
    password: 'qwerty',
  },
  notValid: {
    login: 'neAdmin',
    password: 'abracadabra',
  },
};

export const preparedUser = {
  valid: {
    login: 'MyLogin',
    password: 'password',
    email: 'somemail@gmail.com',
  },
  short: {
    login: 'sb',
    password: 'vvyky',
    email: 'somemailgmail.com',
  },
  long: {
    login: 'Length-11_s',
    password: 'Length-21_GwUy2x2LASw',
    email: 'somemail@gmail.c',
  },
};

export const banUserDto = {
  valid: {
    isBanned: true,
    banReason: 'Length-20_stringstri',
  },
  notValid: {
    isBanned: 'true',
    banReason: 'Length-19_stringstr',
  },
};

export const preparedBlog = {
  valid: {
    name: 'valid name',
    description: 'valid description',
    websiteUrl: 'https://it-incubator.io/',
  },
  notValid: {
    name: 'new valid name',
    description: 'new valid description',
    websiteUrl: 'https://it-incubator.io/new',
  },
  short: {
    name: '',
    description: '',
    websiteUrl: '',
  },
  long: {
    name: 'Length-16_RJmZKM',
    description:
      'Length-501_Zv6FCrIL6WKFyizDZqffLmVhF7j3IdDQouOuO7WWamy5H7FfhGA8aH6FWsKcnBy5QYEvk1vtgIvLmq50mONRGE8vbdpf91EXhZmWXivlFim9srvAQJzes6jPfIzLWXgB7PrSAAclz1Uk2WkIK12fCfUZ90MYVB387mQSh1eCZrotzPjeXev5oE8f9fHPPBpuooSRZmd4z1RPx9jGJs6G1QPfaO1EYRUbD1XonEWBb9cU5YCDSxe5ap2yPoCaNIbjOB6yQfz29XO0cTj46KyQsYCThNE3mmZSbobqpqZeGI0jwrw4SZU9BkzW755w6XRNCljQl64MY60xUgO4dYuR1UAxi5dz9KcMVzRxWVdBUbWLaV7D41ngUnl37ylFdmdGTW8ErpE6ae2IOOWcgyq37L18170MAKafvbolfGNTSVRUYs0eV0j0TrJiuzhROtCPpgDaOxdrzGuwZBwjXAruicca8DGa0dzXm8YSMoG4LI',
    websiteUrl:
      'https://it-incubator.io/new/FrO3tox5Efs0KgUp95aA2QbCmH32uQkqMPYQqjeKpaaCtVu3GXzviSqQ6ZrIYDrdOh96ckaiWI6iCbHrGMiTNRoUeR5i3LI3hGqG',
  },
};

export const preparedPost = {
  valid: {
    title: 'valid title',
    shortDescription: 'valid shortDescription',
    content: 'valid content',
  },
  notValid: {
    title: 'new valid title',
    shortDescription: 'new valid shortDescription',
    content: 'new valid content',
  },
  short: {
    title: '',
    shortDescription: '',
    content: '',
    blogId: '',
  },
  long: {
    title: '',
    shortDescription: '',
    content: '',
    blogId: '',
  },
};
