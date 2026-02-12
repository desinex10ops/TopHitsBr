
async function testShopApi() {
    try {
        console.log("Testing GET http://localhost:3000/api/shop/products");
        const response = await fetch('http://localhost:3000/api/shop/products');

        console.log("Status:", response.status);
        if (response.ok) {
            const data = await response.json();
            console.log("Data:", JSON.stringify(data, null, 2));
        } else {
            console.log("Response text:", await response.text());
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

testShopApi();
