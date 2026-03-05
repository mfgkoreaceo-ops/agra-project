async function testAPI() {
    try {
        const res = await fetch("http://localhost:3000/api/hr/permissions");
        if (!res.ok) {
            console.log("HTTP Error:", res.status, await res.text());
            return;
        }
        const data = await res.json();
        console.log("API returned users length:", data.users?.length);
        if (data.users?.length < 5) console.log(data);
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}
testAPI();
