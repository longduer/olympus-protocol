module.exports = {
  events: (tx) => {
    const logs = tx.logs.map((log) => ({ event: log.event, args: log.args }));
    console.log(JSON.stringify(logs, null, 2));

  },

  catch: async (asycnFunc) => {
    try {
      await asycnFunc();
    } catch (e) {
      console.error('Error on test');
      console.error(e);
      assert(false, 'Exception occured under the test');
    }
  },

  printObject: (data) => {
    data = data.map((attribute) => {

      if (typeof attribute == 'BigNumber') {
        return attribute.toNumber();
      }
      // Number
      return attribute;
    });
    console.log(JSON.stringify(data, null, 2));

  },


}
