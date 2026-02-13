try {
    console.log('Resolving babel-preset-expo...');
    console.log(require.resolve('babel-preset-expo'));
    console.log('Success!');
} catch (e) {
    console.error('Failed to resolve:');
    console.error(e);
}
