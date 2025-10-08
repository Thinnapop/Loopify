const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function seedJamendoTracks(client) {
  try {
    const CLIENT_ID = 'aba8b95b'; // Your Jamendo client ID

    console.log('🌐 Fetching tracks from Jamendo API...');

    // Fetch popular tracks from Jamendo
    const response = await fetch(
      `https://api.jamendo.com/v3.0/tracks/?client_id=${CLIENT_ID}&format=json&limit=100&order=popularity_week&include=musicinfo&audioformat=mp32`
    );

    if (!response.ok) {
      throw new Error(`Jamendo API failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(`📦 Retrieved ${data.results?.length || 0} tracks from Jamendo`);

    if (!data.results || data.results.length === 0) {
      console.log('⚠️ No tracks from Jamendo, using sample data only');
      return;
    }

    let imported = 0;
    let skipped = 0;

    for (const track of data.results.slice(0, 50)) { // Limit to 50 tracks
      try {
        // Check if track already exists
        const existing = await client.query(
          'SELECT "trackid" FROM track WHERE "trackid" = $1',
          [track.id.toString()]
        );

        if (existing.rows.length > 0) {
          skipped++;
          continue;
        }

        // Insert track
        await client.query(
          `INSERT INTO track ("trackid", "title", "durationms", "album", "genre", "coverurl", "releasedate")
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [
            track.id.toString(),
            track.name || 'Unknown Title',
            (track.duration || 180) * 1000, // Convert seconds to ms
            track.album_name || 'Single',
            'Various', // Jamendo doesn't always provide genre
            track.album_image || track.image || `https://picsum.photos/300/300?random=${track.id}`,
          ]
        );

        // Check if artist exists, if not create it
        const artistName = track.artist_name || 'Unknown Artist';
        const artistExists = await client.query(
          'SELECT "artistid" FROM artist WHERE "name" = $1',
          [artistName]
        );

        let artistId;
        if (artistExists.rows.length === 0) {
          artistId = 'artist_jamendo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          await client.query(
            `INSERT INTO artist ("artistid", "name", "country", "debutyear", "followers", "artisttype")
             VALUES ($1, $2, 'Unknown', 2020, 0, 'person')`,
            [artistId, artistName]
          );
        } else {
          artistId = artistExists.rows[0].artistid;
        }

        // Create artist-track relationship
        await client.query(
          `INSERT INTO artisttrack ("artistid", "trackid", "role")
           VALUES ($1, $2, 'primary')
           ON CONFLICT DO NOTHING`,
          [artistId, track.id.toString()]
        );

        imported++;
      } catch (error) {
        console.error(`❌ Failed to import track ${track.id}:`, error.message);
      }
    }

    console.log(`✅ Jamendo seeding complete: ${imported} imported, ${skipped} skipped`);
    console.log('🎵 Database is ready with real music data!');

  } catch (error) {
    console.error('❌ Jamendo seeding failed:', error.message);
    console.log('ℹ️ Continuing with sample data only');
  }
}

async function setupDatabase() {
  // Your Render PostgreSQL connection
  const pool = new Pool({
    connectionString: 'postgresql://loopify_database_user:bRb5mZqjYTJFMuZxrgdY5fsQHmbVP6PN@dpg-d3i6k1odl3ps73cvachg-a.singapore-postgres.render.com/loopify_database',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('📊 Connecting to Render PostgreSQL database...');
    console.log('🌍 Database: loopify_database (Singapore)');
    console.log('');
    
    const client = await pool.connect();
    console.log('✅ Connected successfully!');
    console.log('');
    
    // Read the SQL file
    console.log('📖 Reading SQL schema file...');
    const sqlPath = path.join(__dirname, '../src/data/data.sql');
    console.log(`   Path: ${sqlPath}`);
    
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log(`   File size: ${(sql.length / 1024).toFixed(2)} KB`);
    console.log('');
    
    console.log('🔧 Creating tables and inserting sample data...');
    console.log('⏳ This may take 30-60 seconds...');
    console.log('');
    
    // Execute the SQL
    await client.query(sql);

    console.log('✅ Database schema and sample data loaded!');
    console.log('');

    // Now seed with Jamendo tracks
    console.log('🎵 Seeding database with Jamendo tracks...');
    await seedJamendoTracks(client);

    console.log('✅ Database setup complete!');
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('');
    
    // Verify tables were created
    const tableResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Created Tables:');
    tableResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });
    console.log('');
    
    // Check sample data
    try {
      const userCount = await client.query('SELECT COUNT(*) as count FROM users');
      console.log('👥 Sample Users: ' + userCount.rows[0].count);
      
      const trackCount = await client.query('SELECT COUNT(*) as count FROM track');
      console.log('🎵 Sample Tracks: ' + trackCount.rows[0].count);
      
      const artistCount = await client.query('SELECT COUNT(*) as count FROM artist');
      console.log('🎤 Sample Artists: ' + artistCount.rows[0].count);
      
      const playlistCount = await client.query('SELECT COUNT(*) as count FROM playlist');
      console.log('📝 Sample Playlists: ' + playlistCount.rows[0].count);
      
      console.log('');
      console.log('═══════════════════════════════════════════════');
      console.log('');
      console.log('🎉 SUCCESS! Your database is ready!');
      console.log('');
      console.log('🧪 Test Accounts:');
      console.log('   Email: demo@loopify.com');
      console.log('   Password: demo123');
      console.log('');
      console.log('🌐 Your App:');
      console.log('   Frontend: https://loopify-g41n.onrender.com');
      console.log('   Backend: https://loopify-backend-sshh.onrender.com');
      console.log('');
      console.log('✨ You can now register users and test your app!');
      console.log('');
      
    } catch (countError) {
      console.log('⚠️  Could not count records (this is OK if tables are empty)');
    }
    
    client.release();
    
  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════');
    console.error('❌ ERROR OCCURRED');
    console.error('═══════════════════════════════════════════════');
    console.error('');
    console.error('Error Message:', error.message);
    console.error('');
    
    if (error.code === 'ENOENT') {
      console.error('📁 File not found!');
      console.error('');
      console.error('Looking for: ../src/data/data.sql');
      console.error('');
      console.error('Possible solutions:');
      console.error('1. Make sure data.sql exists at: Loopify/src/data/data.sql');
      console.error('2. Make sure you are running this from: loopify-backend folder');
      console.error('3. Run: cd loopify-backend && node setup-database.js');
      console.error('');
    } else {
      console.error('Full error details:');
      console.error(error);
    }
    
    console.error('═══════════════════════════════════════════════');
    console.error('');
    
  } finally {
    await pool.end();
    console.log('🔌 Database connection closed');
    console.log('');
  }
}

// Run the setup
console.log('');
console.log('═══════════════════════════════════════════════');
console.log('🎵 LOOPIFY DATABASE SETUP');
console.log('═══════════════════════════════════════════════');
console.log('');

setupDatabase();