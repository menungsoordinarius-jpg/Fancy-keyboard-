package com.example

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import android.view.inputmethod.InputMethodManager
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Keyboard
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.MyApplicationTheme

data class AccentTheme(
    val name: String,
    val accentHex: String,
    val gradientStart: String,
    val gradientEnd: String,
    val primaryColor: Color,
    val secondaryColor: Color
)

val PRESET_THEMES = listOf(
    AccentTheme("Nebula Purple", "#8a2be2", "#7b2cbf", "#3a0ca3", Color(0xFF7B2CBF), Color(0xFF3A0CA3)),
    AccentTheme("Cyber Cyan", "#00f5d4", "#00f5d4", "#0077b6", Color(0xFF00F5D4), Color(0xFF0077B6)),
    AccentTheme("Sunset Aurora", "#f72585", "#f72585", "#7209b7", Color(0xFFF72585), Color(0xFF7209B7)),
    AccentTheme("Emerald Glow", "#38b000", "#38b000", "#007200", Color(0xFF38B000), Color(0xFF007200)),
    AccentTheme("Electric Pink", "#ff007f", "#ff007f", "#790038", Color(0xFFFF007F), Color(0xFF790038))
)

open class SettingsActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            MyApplicationTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF0F0B1E)
                ) {
                    SettingsScreen(
                        onOpenImeSettings = {
                            startActivity(Intent(Settings.ACTION_INPUT_METHOD_SETTINGS))
                        },
                        onSelectIme = {
                            val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
                            imm.showInputMethodPicker()
                        }
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onOpenImeSettings: () -> Unit,
    onSelectIme: () -> Unit
) {
    val context = LocalContext.current
    val prefs = remember { context.getSharedPreferences("fancy_keyboard_prefs", Context.MODE_PRIVATE) }

    var opacityPct by remember { mutableFloatStateOf(prefs.getInt("bg_opacity_pct", 85).toFloat()) }
    var glassEnabled by remember { mutableStateOf(prefs.getBoolean("glassmorphism_enabled", true)) }
    var selectedThemeIndex by remember { mutableIntStateOf(prefs.getInt("accent_theme_index", 0)) }
    var testTextInput by remember { mutableStateOf("") }

    val activeTheme = PRESET_THEMES.getOrElse(selectedThemeIndex) { PRESET_THEMES[0] }

    fun savePrefs() {
        prefs.edit()
            .putInt("bg_opacity_pct", opacityPct.toInt())
            .putBoolean("glassmorphism_enabled", glassEnabled)
            .putInt("accent_theme_index", selectedThemeIndex)
            .putString("accent_color_hex", activeTheme.accentHex)
            .putString("gradient_start", activeTheme.gradientStart)
            .putString("gradient_end", activeTheme.gradientEnd)
            .apply()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(Icons.Default.Keyboard, contentDescription = null, tint = activeTheme.primaryColor)
                        Text("Fancy Keyboard Settings", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF140E29))
            )
        },
        containerColor = Color(0xFF0F0B1E)
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Setup / Enable Keyboard Section
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1A1435))
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        "Aktivasi Keyboard",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                    Text(
                        "Aktifkan dan pilih Fancy Keyboard di sistem Android Anda untuk mulai mengetik gaya font unik.",
                        color = Color(0xFFB0A8D0),
                        fontSize = 13.sp
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = onOpenImeSettings,
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = activeTheme.primaryColor)
                        ) {
                            Text("1. Aktifkan IME", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                        OutlinedButton(
                            onClick = onSelectIme,
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp),
                            border = BorderStroke(1.dp, Color.White.copy(alpha = 0.4f))
                        ) {
                            Text("2. Pilih Keyboard", fontSize = 12.sp, color = Color.White)
                        }
                    }
                }
            }

            // Real-time Keyboard Glassmorphism Live Preview Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.Transparent)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(
                            Brush.verticalGradient(
                                listOf(
                                    activeTheme.primaryColor.copy(alpha = opacityPct / 100f),
                                    activeTheme.secondaryColor.copy(alpha = opacityPct / 100f)
                                )
                            )
                        )
                        .border(
                            1.dp,
                            if (glassEnabled) Color.White.copy(alpha = 0.3f) else Color.Transparent,
                            RoundedCornerShape(16.dp)
                        )
                        .padding(16.dp)
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Live Keyboard Preview", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Text("${opacityPct.toInt()}% Opacity", color = Color(0xFFD0C8F0), fontSize = 12.sp)
                        }

                        // Preview key buttons
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            listOf("𝕬𝕭𝕮", "𝓕𝓪𝓷𝓬𝔂", "ⒶⒷⒸ", "𝔸𝔹ℂ", "🅠🅦🅔").forEach { sample ->
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(42.dp)
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(Color.White.copy(alpha = if (glassEnabled) 0.15f else 0.25f))
                                        .border(1.dp, Color.White.copy(alpha = 0.2f), RoundedCornerShape(8.dp)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(sample, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }

            // Tampilan Settings Card (Opacity, Glassmorphism, Theme)
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1A1435))
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(Icons.Default.Palette, contentDescription = null, tint = activeTheme.primaryColor)
                        Text("Kustomisasi Tampilan Keyboard", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    }

                    // 1. Slider Opacity Background
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Opacity Background Keyboard", color = Color.LightGray, fontSize = 13.sp)
                            Text("${opacityPct.toInt()}%", color = activeTheme.primaryColor, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }
                        Slider(
                            value = opacityPct,
                            onValueChange = {
                                opacityPct = it
                                savePrefs()
                            },
                            valueRange = 10f..100f,
                            colors = SliderDefaults.colors(
                                thumbColor = activeTheme.primaryColor,
                                activeTrackColor = activeTheme.primaryColor
                            )
                        )
                    }

                    Divider(color = Color.White.copy(alpha = 0.1f))

                    // 2. Toggle Glassmorphism
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Efek Glassmorphism", color = Color.White, fontWeight = FontWeight.Medium, fontSize = 14.sp)
                            Text("Blur & transparansi pada tombol", color = Color(0xFF9088B0), fontSize = 12.sp)
                        }
                        Switch(
                            checked = glassEnabled,
                            onCheckedChange = {
                                glassEnabled = it
                                savePrefs()
                            },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = activeTheme.primaryColor
                            )
                        )
                    }

                    Divider(color = Color.White.copy(alpha = 0.1f))

                    // 3. Tema Warna Aksen (Nebula)
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Tema Warna Aksen (Nebula)", color = Color.White, fontWeight = FontWeight.Medium, fontSize = 14.sp)
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            PRESET_THEMES.forEachIndexed { index, theme ->
                                val isSelected = index == selectedThemeIndex
                                Box(
                                    modifier = Modifier
                                        .size(48.dp)
                                        .clip(CircleShape)
                                        .background(
                                            Brush.linearGradient(listOf(theme.primaryColor, theme.secondaryColor))
                                        )
                                        .border(
                                            width = if (isSelected) 3.dp else 1.dp,
                                            color = if (isSelected) Color.White else Color.Transparent,
                                            shape = CircleShape
                                        )
                                        .clickable {
                                            selectedThemeIndex = index
                                            savePrefs()
                                            Toast.makeText(context, "Tema ${theme.name} dipilih", Toast.LENGTH_SHORT).show()
                                        },
                                    contentAlignment = Alignment.Center
                                ) {
                                    if (isSelected) {
                                        Icon(Icons.Default.Check, contentDescription = null, tint = Color.White, modifier = Modifier.size(20.dp))
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Live Test Area
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1A1435))
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text("Area Uji Coba Ketik", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Text("Ketuk kolom di bawah untuk memunculkan Fancy Keyboard dan mencoba berbagai font!", color = Color(0xFF9088B0), fontSize = 12.sp)

                    OutlinedTextField(
                        value = testTextInput,
                        onValueChange = { testTextInput = it },
                        modifier = Modifier.fillMaxWidth(),
                        placeholder = { Text("Ketik sesuatu di sini...", color = Color.Gray) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = activeTheme.primaryColor,
                            unfocusedBorderColor = Color.White.copy(alpha = 0.2f),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        ),
                        shape = RoundedCornerShape(12.dp)
                    )
                }
            }
        }
    }
}
