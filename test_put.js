const https = require('https');

async function test() {
    try {
        console.log('Fetching stores...');
        const fetchRes = await fetch('https://agra-website-two.vercel.app/api/hr/stores');
        const stores = await fetchRes.json();
        
        if (!stores || stores.length === 0) {
            console.log('No stores found');
            return;
        }

        const store = stores[0];
        console.log('Found store:', store.id, store.name);

        console.log('Attempting to update store...');
        const putRes = await fetch('https://agra-website-two.vercel.app/api/hr/stores', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: store.id,
                name: store.name,
                erpName: store.erpName || 'test',
                address: store.address,
                contact: store.contact
            })
        });

        const text = await putRes.text();
        console.log('PUT Response Status:', putRes.status);
        console.log('PUT Response Body:', text);
    } catch (e) {
        console.error(e);
    }
}
test();
