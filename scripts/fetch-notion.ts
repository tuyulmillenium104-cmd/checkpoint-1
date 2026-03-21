import ZAI from 'z-ai-web-dev-sdk';

async function fetchNotionPage() {
  try {
    const zai = await ZAI.create();
    
    const result = await zai.functions.invoke('page_reader', {
      url: 'https://bloom-rover-b76.notion.site/How-You-Can-Contribute-To-GenLayer-1d75ecdf5d8b809e95c0dcc03585d04c'
    });

    console.log('Title:', result.data.title);
    console.log('URL:', result.data.url);
    console.log('Published:', result.data.publishedTime);
    console.log('\n--- HTML Content ---\n');
    console.log(result.data.html?.substring(0, 10000));
    console.log('\n--- Text Content ---\n');
    const text = result.data.html?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log(text?.substring(0, 10000));
  } catch (error) {
    console.error('Error:', error);
  }
}

fetchNotionPage();
